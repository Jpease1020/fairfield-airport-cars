# Section Comparison Workflow

This workflow helps you capture before/after snapshots of specific sections using Playwright, make design changes, and then compare the results to evaluate if your changes actually improved the design.

## 🎯 Purpose

- **Visual Regression Testing**: Capture snapshots of sections before and after changes
- **Design Validation**: Ensure changes actually improve the user experience
- **Quality Assurance**: Compare visual hierarchy, spacing, and accessibility
- **Documentation**: Keep a visual record of design evolution

## 🚀 Quick Start

### 1. Run Complete Workflow
```bash
./scripts/section-comparison-workflow.sh workflow
```

This will:
1. Capture BEFORE snapshots of all sections
2. Pause for you to make design changes
3. Capture AFTER snapshots
4. Generate a comparison report

### 2. Capture Specific Section
```bash
./scripts/section-comparison-workflow.sh custom '.hero-section'
```

### 3. Manual Step-by-Step
```bash
# Step 1: Capture before snapshots
./scripts/section-comparison-workflow.sh before

# Step 2: Make your design changes in the code

# Step 3: Capture after snapshots
./scripts/section-comparison-workflow.sh after

# Step 4: Generate comparison report
./scripts/section-comparison-workflow.sh report

# Step 5: Open the report
./scripts/section-comparison-workflow.sh open
```

## 📁 Output Files

All snapshots and reports are saved to `test-results/section-comparison/`:

```
test-results/section-comparison/
├── before-header.png
├── before-hero.png
├── before-features.png
├── before-footer.png
├── before-booking-form.png
├── before-full-page.png
├── after-header.png
├── after-hero.png
├── after-features.png
├── after-footer.png
├── after-booking-form.png
├── after-full-page.png
├── mobile-header.png
├── mobile-hero.png
├── mobile-booking-form.png
├── mobile-footer.png
├── custom-before.png
└── comparison-report.html
```

## 🎨 Sections Captured

The workflow automatically captures these common sections:

| Section | Selector | Description |
|---------|----------|-------------|
| Header | `header, .header, nav` | Navigation and header area |
| Hero | `.hero, .banner, [class*="hero"]` | Main banner/hero section |
| Features | `.features, [class*="feature"], .grid` | Feature cards or grid sections |
| Footer | `footer, .footer` | Footer area |
| Booking Form | `.booking-form, form, [class*="form"]` | Forms and booking interfaces |
| Testimonials | `.testimonials, [class*="testimonial"]` | Customer testimonials |
| Pricing | `.pricing, [class*="price"]` | Pricing tables or cards |
| Contact | `.contact, [class*="contact"]` | Contact information |

## 🔧 Customization

### Adding New Sections

Edit `tests/e2e/section-comparison.spec.ts` and add to the `sections` array:

```typescript
const sections = [
  // ... existing sections
  { name: 'new-section', selector: '.your-custom-selector' }
];
```

### Custom Section Focus

For specific sections you're working on:

```bash
# Capture a specific section
./scripts/section-comparison-workflow.sh custom '.your-specific-selector'
```

### Mobile Testing

The workflow automatically captures mobile versions of key sections:
- Header
- Hero
- Booking Form
- Footer

## 📊 Analysis Guidelines

When comparing before/after snapshots, evaluate:

### Visual Hierarchy
- [ ] Is the most important information most prominent?
- [ ] Are headings and text properly sized and weighted?
- [ ] Is the visual flow logical and intuitive?

### Spacing and Layout
- [ ] Is there adequate white space?
- [ ] Are elements properly aligned?
- [ ] Is the layout balanced and harmonious?

### Readability and Accessibility
- [ ] Is text readable with good contrast?
- [ ] Are interactive elements clearly identifiable?
- [ ] Is the design accessible to users with disabilities?

### Mobile Responsiveness
- [ ] Does the design work well on mobile devices?
- [ ] Are touch targets appropriately sized?
- [ ] Is content properly stacked on smaller screens?

### Design Consistency
- [ ] Are colors, fonts, and spacing consistent?
- [ ] Do elements follow the design system?
- [ ] Is the brand identity maintained?

## 🛠️ Technical Details

### Test Configuration

The tests run with these settings:
- **Viewport**: 1200x800 (desktop), 375x667 (mobile)
- **Browser**: Chromium (default)
- **Timeout**: 5 seconds per section
- **Full Page**: Captured for context

### Error Handling

The workflow gracefully handles:
- Missing sections (logs warning)
- Timeout errors (logs error)
- Network issues (retries automatically)

### Performance

- **Parallel Execution**: Tests run in parallel where possible
- **Caching**: Playwright caches browser instances
- **Incremental**: Only captures sections that exist

## 🔍 Advanced Usage

### Multiple Viewports

To test different screen sizes, modify the test:

```typescript
// Test tablet viewport
await page.setViewportSize({ width: 768, height: 1024 });
```

### Accessibility Testing

Add accessibility checks to your workflow:

```typescript
// Check for proper ARIA labels
const ariaLabel = await element.getAttribute('aria-label');
expect(ariaLabel).toBeTruthy();

// Check color contrast
const contrast = await element.evaluate((el) => {
  // Add contrast calculation logic
});
```

### Performance Metrics

Capture performance data alongside visual snapshots:

```typescript
// Measure load time
const loadTime = await page.evaluate(() => performance.timing.loadEventEnd - performance.timing.navigationStart);
console.log(`Page load time: ${loadTime}ms`);
```

## 🚨 Troubleshooting

### Common Issues

**Dev server not running**
```bash
# Start dev server manually
npm run dev
```

**Sections not found**
- Check CSS selectors in the test file
- Verify elements are visible (not hidden by CSS)
- Ensure page is fully loaded

**Screenshots are blank**
- Check if elements are in viewport
- Verify no CSS transforms are hiding elements
- Ensure proper wait conditions

**Mobile snapshots look wrong**
- Check responsive breakpoints
- Verify mobile-specific CSS is loaded
- Test with different mobile viewports

### Debug Mode

Run with verbose logging:

```bash
npx playwright test tests/e2e/section-comparison.spec.ts --debug
```

### Manual Testing

Open the browser manually to inspect elements:

```bash
npx playwright test tests/e2e/section-comparison.spec.ts --headed
```

## 📈 Best Practices

### Before Making Changes
1. **Plan your changes** - Know what you want to improve
2. **Capture baseline** - Run before snapshots
3. **Document goals** - Write down what you're trying to achieve

### During Development
1. **Make incremental changes** - Small, testable improvements
2. **Test frequently** - Capture snapshots after each change
3. **Get feedback** - Share snapshots with team members

### After Changes
1. **Compare systematically** - Use the comparison report
2. **Measure impact** - Quantify improvements where possible
3. **Document learnings** - Note what worked and what didn't

### Continuous Improvement
1. **Regular snapshots** - Capture snapshots weekly/monthly
2. **Track trends** - Monitor design evolution over time
3. **Share results** - Include snapshots in design reviews

## 🎯 Integration with Design Process

### Design Reviews
- Include before/after snapshots in design reviews
- Use snapshots to demonstrate improvements
- Track design decisions with visual evidence

### User Testing
- Use snapshots to prepare for user testing
- Compare user feedback with visual changes
- Document user reactions to design changes

### Stakeholder Communication
- Share snapshots with stakeholders
- Use visual evidence to support design decisions
- Create visual progress reports

## 📚 Related Documentation

- [Playwright Testing Guide](../testing/COMPREHENSIVE_TESTING_GUIDE.md)
- [Design System Documentation](../design-system/DESIGN_SYSTEM.md)
- [Visual Regression Testing](../testing/VISUAL_REGRESSION_GUIDE.md)
- [Accessibility Testing](../testing/ACCESSIBILITY_TESTING.md)

---

**Remember**: The goal is not just to capture snapshots, but to use them as a tool for making better design decisions. Always ask yourself: "Does this change actually improve the user experience?" 