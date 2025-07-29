import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Section Comparison and Improvement Analysis', () => {
  const testResultsDir = 'test-results/section-comparison';
  
  // Ensure test results directory exists
  test.beforeAll(async () => {
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }
  });

  test('Capture section snapshot before changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Capture different sections - you can modify these selectors based on what you want to test
    const sections = [
      { name: 'header', selector: 'header, .header, nav' },
      { name: 'hero', selector: '.hero, .banner, [class*="hero"], [data-testid="booking-hero"]' },
      { name: 'features', selector: '.features, [class*="feature"], .grid' },
      { name: 'footer', selector: 'footer, .footer' },
      { name: 'booking-form', selector: '.booking-form, form, [class*="form"], [data-testid="booking-form"]' },
      { name: 'testimonials', selector: '.testimonials, [class*="testimonial"]' },
      { name: 'pricing', selector: '.pricing, [class*="price"]' },
      { name: 'contact', selector: '.contact, [class*="contact"]' }
    ];

    for (const section of sections) {
      try {
        const element = page.locator(section.selector);
        const isVisible = await element.isVisible();
        
        if (isVisible) {
          // Capture the section
          await element.screenshot({
            path: `${testResultsDir}/before-${section.name}.png`,
            timeout: 5000
          });
          
          console.log(`✅ Captured before snapshot for ${section.name}`);
        } else {
          console.log(`⚠️  Section ${section.name} not found or not visible`);
        }
      } catch (error) {
        console.log(`❌ Error capturing ${section.name}:`, (error as Error).message);
      }
    }

    // Also capture full page for context
    await page.screenshot({
      path: `${testResultsDir}/before-full-page.png`,
      fullPage: true
    });
  });

  test('Capture section snapshot after changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Capture the same sections after your changes
    const sections = [
      { name: 'header', selector: 'header, .header, nav' },
      { name: 'hero', selector: '.hero, .banner, [class*="hero"], [data-testid="booking-hero"]' },
      { name: 'features', selector: '.features, [class*="feature"], .grid' },
      { name: 'footer', selector: 'footer, .footer' },
      { name: 'booking-form', selector: '.booking-form, form, [class*="form"], [data-testid="booking-form"]' },
      { name: 'testimonials', selector: '.testimonials, [class*="testimonial"]' },
      { name: 'pricing', selector: '.pricing, [class*="price"]' },
      { name: 'contact', selector: '.contact, [class*="contact"]' }
    ];

    for (const section of sections) {
      try {
        const element = page.locator(section.selector);
        const isVisible = await element.isVisible();
        
        if (isVisible) {
          // Capture the section
          await element.screenshot({
            path: `${testResultsDir}/after-${section.name}.png`,
            timeout: 5000
          });
          
          console.log(`✅ Captured after snapshot for ${section.name}`);
        } else {
          console.log(`⚠️  Section ${section.name} not found or not visible`);
        }
      } catch (error) {
        console.log(`❌ Error capturing ${section.name}:`, (error as Error).message);
      }
    }

    // Also capture full page for context
    await page.screenshot({
      path: `${testResultsDir}/after-full-page.png`,
      fullPage: true
    });
  });

  test('Capture book page specific sections', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Book page specific sections
    const bookPageSections = [
      { name: 'book-hero', selector: '[data-testid="booking-hero"]' },
      { name: 'book-form', selector: 'form, [class*="form"]' },
      { name: 'book-header', selector: 'header, .header, nav' },
      { name: 'book-footer', selector: 'footer, .footer' }
    ];

    for (const section of bookPageSections) {
      try {
        const element = page.locator(section.selector);
        const isVisible = await element.isVisible();
        
        if (isVisible) {
          // Capture the section
          await element.screenshot({
            path: `${testResultsDir}/book-${section.name}.png`,
            timeout: 5000
          });
          
          console.log(`✅ Captured book page snapshot for ${section.name}`);
        } else {
          console.log(`⚠️  Book page section ${section.name} not found or not visible`);
        }
      } catch (error) {
        console.log(`❌ Error capturing book page ${section.name}:`, (error as Error).message);
      }
    }

    // Also capture full book page for context
    await page.screenshot({
      path: `${testResultsDir}/book-full-page.png`,
      fullPage: true
    });
  });

  test('Compare specific section with custom selector', async ({ page }) => {
    // This test allows you to focus on a specific section you want to improve
    const customSelector = '.your-specific-section'; // Replace with your target selector
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.setViewportSize({ width: 1200, height: 800 });
    
    try {
      const element = page.locator(customSelector);
      const isVisible = await element.isVisible();
      
      if (isVisible) {
        // Capture before snapshot
        await element.screenshot({
          path: `${testResultsDir}/custom-before.png`,
          timeout: 5000
        });
        
        console.log(`✅ Captured custom section before snapshot`);
        
        // You can also capture additional details about the element
        const elementInfo = await element.evaluate((el) => ({
          tagName: el.tagName,
          className: el.className,
          textContent: el.textContent?.substring(0, 100),
          boundingBox: el.getBoundingClientRect()
        }));
        
        console.log('Element info:', elementInfo);
      } else {
        console.log(`⚠️  Custom section not found or not visible`);
      }
    } catch (error) {
      console.log(`❌ Error capturing custom section:`, (error as Error).message);
    }
  });

  test('Mobile responsive section comparison', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const sections = [
      { name: 'header', selector: 'header, .header, nav' },
      { name: 'hero', selector: '.hero, .banner, [class*="hero"], [data-testid="booking-hero"]' },
      { name: 'booking-form', selector: '.booking-form, form, [class*="form"], [data-testid="booking-form"]' },
      { name: 'footer', selector: 'footer, .footer' }
    ];

    for (const section of sections) {
      try {
        const element = page.locator(section.selector);
        const isVisible = await element.isVisible();
        
        if (isVisible) {
          await element.screenshot({
            path: `${testResultsDir}/mobile-${section.name}.png`,
            timeout: 5000
          });
          
          console.log(`✅ Captured mobile snapshot for ${section.name}`);
        }
      } catch (error) {
        console.log(`❌ Error capturing mobile ${section.name}:`, (error as Error).message);
      }
    }
  });

  test('Page-specific section comparison', async ({ page }) => {
    const pages = [
      { name: 'home', path: '/' },
      { name: 'book', path: '/book' },
      { name: 'about', path: '/about' },
      { name: 'help', path: '/help' }
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      await page.setViewportSize({ width: 1200, height: 800 });
      
      // Capture page-specific sections
      const pageSections = [
        { name: 'header', selector: 'header, .header, nav' },
        { name: 'hero', selector: '.hero, .banner, [class*="hero"], [data-testid="booking-hero"]' },
        { name: 'main-content', selector: 'main, [role="main"], .main' },
        { name: 'footer', selector: 'footer, .footer' }
      ];

      for (const section of pageSections) {
        try {
          const element = page.locator(section.selector);
          const isVisible = await element.isVisible();
          
          if (isVisible) {
            await element.screenshot({
              path: `${testResultsDir}/${pageInfo.name}-${section.name}.png`,
              timeout: 5000
            });
            
            console.log(`✅ Captured ${pageInfo.name} page snapshot for ${section.name}`);
          }
        } catch (error) {
          console.log(`❌ Error capturing ${pageInfo.name} page ${section.name}:`, (error as Error).message);
        }
      }

      // Capture full page
      await page.screenshot({
        path: `${testResultsDir}/${pageInfo.name}-full-page.png`,
        fullPage: true
      });
    }
  });

  test('Generate comparison report', async () => {
    // This test generates a simple HTML report comparing the snapshots
    const reportPath = `${testResultsDir}/comparison-report.html`;
    
    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Section Comparison Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .comparison { display: flex; margin: 20px 0; }
        .before, .after { flex: 1; margin: 0 10px; }
        img { max-width: 100%; border: 1px solid #ccc; }
        h2 { color: #333; }
        .section { margin: 30px 0; }
        .page-section { margin: 40px 0; border-top: 2px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <h1>Section Comparison Report</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
    
    <div class="section">
        <h2>Home Page Comparison</h2>
        <div class="comparison">
            <div class="before">
                <h3>Before</h3>
                <img src="before-full-page.png" alt="Before - Full Page" />
            </div>
            <div class="after">
                <h3>After</h3>
                <img src="after-full-page.png" alt="After - Full Page" />
            </div>
        </div>
    </div>
    
    <div class="page-section">
        <h2>Book Page Specific Sections</h2>
        <p>Check the test-results/section-comparison directory for book page snapshots:</p>
        <ul>
            <li>book-hero.png - Book page hero section</li>
            <li>book-form.png - Booking form</li>
            <li>book-full-page.png - Full book page</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Individual Sections</h2>
        <p>Check the test-results/section-comparison directory for individual section snapshots.</p>
    </div>
    
    <div class="section">
        <h2>Analysis Notes</h2>
        <ul>
            <li>Compare visual hierarchy and spacing</li>
            <li>Check for improved readability and accessibility</li>
            <li>Evaluate mobile responsiveness</li>
            <li>Assess color contrast and typography</li>
            <li>Verify design consistency across pages</li>
            <li>Pay special attention to book page hero vs other pages</li>
        </ul>
    </div>
</body>
</html>`;

    fs.writeFileSync(reportPath, reportHtml);
    console.log(`📊 Comparison report generated: ${reportPath}`);
  });
}); 