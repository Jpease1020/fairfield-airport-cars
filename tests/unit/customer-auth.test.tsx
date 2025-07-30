import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, beforeEach, expect, vi } from 'vitest';
import { createCustomerAccount, getCustomerProfile, updateCustomerProfile, resetPassword } from '@/lib/services/auth-service';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock Firebase auth
vi.mock('@/lib/utils/firebase', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
}));

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendEmailVerification: vi.fn(),
}));

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
}));

describe('🎯 Customer Authentication System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('🔐 Customer Account Creation', () => {
    test('should create customer account successfully', async () => {
      const mockUser = {
        uid: 'customer-123',
        email: 'test@example.com',
      };

      const { createUserWithEmailAndPassword, sendEmailVerification } = await import('firebase/auth');
      const { setDoc } = await import('firebase/firestore');

      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as any);
      vi.mocked(sendEmailVerification).mockResolvedValue();
      vi.mocked(setDoc).mockResolvedValue();

      const result = await createCustomerAccount(
        'test@example.com',
        'password123',
        'John Doe',
        '(555) 123-4567'
      );

      expect(result).toEqual(mockUser);
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
      expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
      expect(setDoc).toHaveBeenCalledTimes(2); // customer profile + user role
    });

    test('should handle account creation errors', async () => {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(
        new Error('Email already in use')
      );

      await expect(
        createCustomerAccount('test@example.com', 'password123', 'John Doe', '(555) 123-4567')
      ).rejects.toThrow('Email already in use');
    });
  });

  describe('👤 Customer Profile Management', () => {
    test('should get customer profile successfully', async () => {
      const mockProfile = {
        uid: 'customer-123',
        email: 'test@example.com',
        name: 'John Doe',
        phone: '(555) 123-4567',
        createdAt: new Date(),
        lastLogin: new Date(),
        totalBookings: 5,
        totalSpent: 250.00,
        preferences: {
          notifications: {
            email: true,
            sms: true,
          },
        },
      };

      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockProfile,
      } as any);

      const result = await getCustomerProfile('customer-123');

      expect(result).toEqual(mockProfile);
    });

    test('should return null for non-existent profile', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getCustomerProfile('non-existent');

      expect(result).toBeNull();
    });

    test('should update customer profile successfully', async () => {
      const { setDoc, doc } = await import('firebase/firestore');
      vi.mocked(setDoc).mockResolvedValue();
      vi.mocked(doc).mockReturnValue('mock-doc-ref' as any);

      const updates = {
        name: 'Jane Doe',
        phone: '(555) 987-6543',
      };

      await updateCustomerProfile('customer-123', updates);

      expect(setDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        updates,
        { merge: true }
      );
    });
  });

  describe('🔑 Password Reset', () => {
    test('should send password reset email successfully', async () => {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      vi.mocked(sendPasswordResetEmail).mockResolvedValue();

      await resetPassword('test@example.com');

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com'
      );
    });

    test('should handle password reset errors', async () => {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      vi.mocked(sendPasswordResetEmail).mockRejectedValue(
        new Error('User not found')
      );

      await expect(resetPassword('nonexistent@example.com')).rejects.toThrow('User not found');
    });
  });

  describe('🎯 Auth Service Class', () => {
    test('should validate customer role correctly', async () => {
      const { AuthService } = await import('@/lib/services/auth-service');
      const authService = AuthService.getInstance();

      // Mock getUserRole to return customer role
      const mockGetUserRole = vi.fn().mockResolvedValue({
        uid: 'customer-123',
        email: 'test@example.com',
        role: 'customer',
        permissions: ['read', 'book'],
      });

      // Replace the getUserRole method
      authService.getUserRole = mockGetUserRole;

      const isCustomer = await authService.isCustomer('customer-123');

      expect(isCustomer).toBe(true);
      expect(mockGetUserRole).toHaveBeenCalledWith('customer-123');
    });

    test('should return false for non-customer users', async () => {
      const { AuthService } = await import('@/lib/services/auth-service');
      const authService = AuthService.getInstance();

      const mockGetUserRole = vi.fn().mockResolvedValue({
        uid: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['read', 'write', 'admin'],
      });

      authService.getUserRole = mockGetUserRole;

      const isCustomer = await authService.isCustomer('admin-123');

      expect(isCustomer).toBe(false);
    });
  });
}); 