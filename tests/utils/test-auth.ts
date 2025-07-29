import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/utils/firebase';

// Test user credentials - these should be set in environment variables
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@fairfieldairportcar.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

export class TestAuthHelper {
  /**
   * Sign in with test user credentials
   */
  static async signInTestUser() {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      console.log(`✅ Test user signed in: ${userCredential.user.email}`);
      return userCredential.user;
    } catch (error) {
      console.error('❌ Failed to sign in test user:', error);
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  static async signOutUser() {
    try {
      await signOut(auth);
      console.log('✅ Test user signed out');
    } catch (error) {
      console.error('❌ Failed to sign out test user:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  static getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Check if user is signed in
   */
  static isSignedIn() {
    return !!auth.currentUser;
  }

  /**
   * Get test user credentials
   */
  static getTestCredentials() {
    return {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    };
  }
}

/**
 * Playwright helper to sign in during tests
 */
export async function signInTestUser(page: any) {
  // Navigate to login page
  await page.goto('/admin/login');
  
  // Wait for login form to load
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  // Fill in credentials
  await page.fill('input[type="email"]', TEST_USER_EMAIL);
  await page.fill('input[type="password"]', TEST_USER_PASSWORD);
  
  // Click sign in button
  await page.click('button[type="submit"]');
  
  // Wait for redirect or success
  await page.waitForTimeout(3000);
  
  // Check if we're on admin dashboard or still on login page
  const currentUrl = page.url();
  if (currentUrl.includes('/admin/login')) {
    console.log('⚠️ Still on login page - checking for errors');
    const errorText = await page.locator('body').textContent();
    console.log('Login page content:', errorText?.substring(0, 200));
  } else {
    console.log('✅ Successfully signed in and redirected');
  }
}

/**
 * Playwright helper to ensure user is signed in for admin pages
 */
export async function ensureSignedIn(page: any) {
  // Check if we're already on an admin page
  const currentUrl = page.url();
  
  if (currentUrl.includes('/admin/login')) {
    // We're on login page, sign in
    await signInTestUser(page);
  } else if (currentUrl.includes('/admin/')) {
    // We're on an admin page, check if we need to sign in
    const bodyText = await page.locator('body').textContent() || '';
    const isLoginPage = bodyText.toLowerCase().includes('login') || 
                       bodyText.toLowerCase().includes('sign in');
    
    if (isLoginPage) {
      // We got redirected to login, sign in
      await signInTestUser(page);
    }
  }
} 