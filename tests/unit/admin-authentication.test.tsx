import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/admin/login',
}));

// Mock Firebase Auth
const mockSignInWithEmailAndPassword = jest.fn();
const mockSignInWithPopup = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockGetAuth = jest.fn(() => ({}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signInWithPopup: mockSignInWithPopup,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  getAuth: mockGetAuth,
}));

// Mock Google Auth Provider
const mockGoogleAuthProvider = jest.fn();
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  GoogleAuthProvider: mockGoogleAuthProvider,
}));

describe('Admin Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Form', () => {
    test('renders login form with all required fields', async () => {
      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Verify form elements exist
      expect(screen.getByTestId('login-card')).toBeInTheDocument();
      expect(screen.getByTestId('login-title')).toBeInTheDocument();
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('email-label')).toBeInTheDocument();
      expect(screen.getByTestId('password-label')).toBeInTheDocument();
      expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
      expect(screen.getByTestId('google-sign-in-button')).toBeInTheDocument();
    });

    test('validates required fields', async () => {
      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Try to submit without filling form
      fireEvent.click(screen.getByTestId('sign-in-button'));

      // Should show validation errors or prevent submission
      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled();
      });
    });

    test('handles successful email/password login', async () => {
      mockSignInWithEmailAndPassword.mockResolvedValueOnce({
        user: { 
          email: 'gregg@fairfieldairportcar.com',
          uid: 'admin-user-123'
        }
      });

      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Fill login form
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'gregg@fairfieldairportcar.com' }
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' }
      });

      // Submit login
      fireEvent.click(screen.getByTestId('sign-in-button'));

      // Verify authentication call
      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'gregg@fairfieldairportcar.com',
          'password123'
        );
      });
    });

    test('handles login errors', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(
        new Error('Invalid credentials')
      );

      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Fill login form
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'wrong@email.com' }
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'wrongpassword' }
      });

      // Submit login
      fireEvent.click(screen.getByTestId('sign-in-button'));

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });

    test('handles Google sign in', async () => {
      mockSignInWithPopup.mockResolvedValueOnce({
        user: { 
          email: 'gregg@fairfieldairportcar.com',
          uid: 'admin-user-123'
        }
      });

      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Click Google sign in
      fireEvent.click(screen.getByTestId('google-sign-in-button'));

      // Verify Google authentication call
      await waitFor(() => {
        expect(mockSignInWithPopup).toHaveBeenCalled();
      });
    });

    test('handles Google sign in errors', async () => {
      mockSignInWithPopup.mockRejectedValueOnce(
        new Error('Google sign in failed')
      );

      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Click Google sign in
      fireEvent.click(screen.getByTestId('google-sign-in-button'));

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication State Management', () => {
    test('redirects authenticated users to admin dashboard', async () => {
      // Mock authenticated state
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback({
          user: { 
            email: 'gregg@fairfieldairportcar.com',
            uid: 'admin-user-123'
          }
        });
        return () => {};
      });

      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Should redirect to admin dashboard
      await waitFor(() => {
        expect(window.location.href).toBe('/admin');
      });
    });

    test('shows loading state during authentication', async () => {
      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Fill and submit form
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'gregg@fairfieldairportcar.com' }
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' }
      });

      // Mock loading state
      mockSignInWithEmailAndPassword.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      fireEvent.click(screen.getByTestId('sign-in-button'));

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByTestId('sign-in-button')).toBeDisabled();
      });
    });
  });

  describe('Security Features', () => {
    test('prevents access to admin pages without authentication', async () => {
      // Mock unauthenticated state
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return () => {};
      });

      const { default: AdminPage } = await import('@/app/admin/page');
      render(<AdminPage />);

      // Should redirect to login
      await waitFor(() => {
        expect(window.location.href).toBe('/admin/login');
      });
    });

    test('validates admin email addresses', async () => {
      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Try to login with non-admin email
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'customer@example.com' }
      });
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByTestId('sign-in-button'));

      // Should show access denied error
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      });
    });
  });
}); 