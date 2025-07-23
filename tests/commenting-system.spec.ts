import { test, expect } from '@playwright/test';

test.describe('Commenting System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should enable admin mode automatically in development', async ({ page }) => {
    // Check if admin toggle button is visible
    const adminButton = page.locator('button:has-text("Enable Admin"), button:has-text("Disable Admin")');
    await expect(adminButton).toBeVisible();
    
    // Check if hamburger menu appears (indicates admin mode is active)
    const hamburgerMenu = page.locator('button[aria-label="Admin menu"]');
    await expect(hamburgerMenu).toBeVisible();
  });

  test('should enable comment mode via hamburger menu', async ({ page }) => {
    // Open hamburger menu
    const hamburgerButton = page.locator('button[aria-label="Admin menu"]');
    await hamburgerButton.click();
    
    // Click on "UI Change Requests" to enable comment mode
    const commentModeButton = page.locator('button:has-text("UI Change Requests")');
    await commentModeButton.click();
    
    // Verify comment mode is active (yellow indicator)
    const commentIndicator = page.locator('div:has-text("Comment Mode: ON")');
    await expect(commentIndicator).toBeVisible();
  });

  test('should add comment when clicking on page elements', async ({ page }) => {
    // Enable comment mode first
    const hamburgerButton = page.locator('button[aria-label="Admin menu"]');
    await hamburgerButton.click();
    
    const commentModeButton = page.locator('button:has-text("UI Change Requests")');
    await commentModeButton.click();
    
    // Wait for comment mode to be active
    await page.waitForTimeout(1000);
    
    // Click on a page element (hero title)
    const heroTitle = page.locator('h1:has-text("Premium Airport Transportation")');
    await heroTitle.click();
    
    // Verify comment box appears
    const commentBox = page.locator('div[role="dialog"], .comment-box, textarea');
    await expect(commentBox).toBeVisible();
  });

  test('should not add comment when clicking on interactive elements', async ({ page }) => {
    // Enable comment mode
    const hamburgerButton = page.locator('button[aria-label="Admin menu"]');
    await hamburgerButton.click();
    
    const commentModeButton = page.locator('button:has-text("UI Change Requests")');
    await commentModeButton.click();
    
    await page.waitForTimeout(1000);
    
    // Try clicking on a button (should not trigger comment)
    const bookButton = page.locator('a:has-text("Book Now")');
    await bookButton.click();
    
    // Verify no comment box appears
    const commentBox = page.locator('div[role="dialog"], .comment-box, textarea');
    await expect(commentBox).not.toBeVisible();
  });

  test('should not add comment when clicking on comment elements', async ({ page }) => {
    // Enable comment mode
    const hamburgerButton = page.locator('button[aria-label="Admin menu"]');
    await hamburgerButton.click();
    
    const commentModeButton = page.locator('button:has-text("UI Change Requests")');
    await commentModeButton.click();
    
    await page.waitForTimeout(1000);
    
    // Try clicking on the hamburger menu itself (should not trigger comment)
    await hamburgerButton.click();
    
    // Verify no additional comment box appears
    const commentBoxes = page.locator('div[role="dialog"], .comment-box, textarea');
    await expect(commentBoxes).toHaveCount(0);
  });

  test('should save comment to localStorage when Firebase fails', async ({ page }) => {
    // Enable comment mode
    const hamburgerButton = page.locator('button[aria-label="Admin menu"]');
    await hamburgerButton.click();
    
    const commentModeButton = page.locator('button:has-text("UI Change Requests")');
    await commentModeButton.click();
    
    await page.waitForTimeout(1000);
    
    // Click on a page element
    const heroTitle = page.locator('h1:has-text("Premium Airport Transportation")');
    await heroTitle.click();
    
    // Add a comment
    const commentTextarea = page.locator('textarea');
    await commentTextarea.fill('Test comment from Playwright');
    
    const submitButton = page.locator('button:has-text("Add Comment"), button:has-text("Submit")');
    await submitButton.click();
    
    // Verify comment is saved (check localStorage)
    const storedComments = await page.evaluate(() => {
      return localStorage.getItem('confluence-comments');
    });
    
    expect(storedComments).toBeTruthy();
    expect(JSON.parse(storedComments || '[]')).toHaveLength(1);
  });

  test('should show comment indicators on elements with comments', async ({ page }) => {
    // First, add a comment
    const hamburgerButton = page.locator('button[aria-label="Admin menu"]');
    await hamburgerButton.click();
    
    const commentModeButton = page.locator('button:has-text("UI Change Requests")');
    await commentModeButton.click();
    
    await page.waitForTimeout(1000);
    
    // Add a comment to hero title
    const heroTitle = page.locator('h1:has-text("Premium Airport Transportation")');
    await heroTitle.click();
    
    const commentTextarea = page.locator('textarea');
    await commentTextarea.fill('Test comment');
    
    const submitButton = page.locator('button:has-text("Add Comment"), button:has-text("Submit")');
    await submitButton.click();
    
    // Wait for comment to be saved
    await page.waitForTimeout(1000);
    
    // Verify comment indicator appears
    const commentIcon = page.locator('.simple-comment-icon, [data-comment-id]');
    await expect(commentIcon).toBeVisible();
  });

  test('should toggle between edit and comment modes', async ({ page }) => {
    // Open hamburger menu
    const hamburgerButton = page.locator('button[aria-label="Admin menu"]');
    await hamburgerButton.click();
    
    // Enable edit mode
    const editModeButton = page.locator('button:has-text("Edit Mode")');
    await editModeButton.click();
    
    // Verify edit mode is active
    const editIndicator = page.locator('div:has-text("Edit Mode: ON")');
    await expect(editIndicator).toBeVisible();
    
    // Switch to comment mode
    const commentModeButton = page.locator('button:has-text("UI Change Requests")');
    await commentModeButton.click();
    
    // Verify comment mode is active and edit mode is off
    const commentIndicator = page.locator('div:has-text("Comment Mode: ON")');
    await expect(commentIndicator).toBeVisible();
    
    const editIndicatorOff = page.locator('div:has-text("Edit Mode: OFF")');
    await expect(editIndicatorOff).toBeVisible();
  });
}); 