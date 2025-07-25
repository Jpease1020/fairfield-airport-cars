import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AuthService } from '@/lib/services/auth-service';

// Mock Firebase
jest.mock('@/lib/utils/firebase', () => ({
  auth: {
    currentUser: { uid: 'test-uid' }
  },
  db: {
    collection: jest.fn()
  }
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn()
}));

describe('Admin Authentication Tests', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = AuthService.getInstance();
  });

  describe('validateAdminAccess', () => {
    it('should validate admin access for admin user', async () => {
      // Mock successful admin validation
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          uid: 'test-uid',
          email: 'admin@fairfieldairportcar.com',
          role: 'admin',
          permissions: ['read', 'write', 'admin'],
          createdAt: new Date(),
          lastLogin: new Date()
        })
      });

      const result = await authService.validateAdminAccess('test-uid');
      
      expect(result).toBe(true);
    });

    it('should reject non-admin user', async () => {
      // Mock non-admin user
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          uid: 'test-uid',
          email: 'user@example.com',
          role: 'user',
          permissions: ['read'],
          createdAt: new Date(),
          lastLogin: new Date()
        })
      });

      const result = await authService.validateAdminAccess('test-uid');
      
      expect(result).toBe(false);
    });

    it('should handle missing user data', async () => {
      // Mock missing user
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null
      });

      const result = await authService.validateAdminAccess('test-uid');
      
      expect(result).toBe(false);
    });
  });

  describe('getUserRole', () => {
    it('should return user role for valid user', async () => {
      // Mock successful user role retrieval
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          uid: 'test-uid',
          email: 'admin@fairfieldairportcar.com',
          role: 'admin',
          permissions: ['read', 'write', 'admin'],
          createdAt: new Date(),
          lastLogin: new Date()
        })
      });

      const userRole = await authService.getUserRole('test-uid');
      
      expect(userRole).toEqual({
        uid: 'test-uid',
        email: 'admin@fairfieldairportcar.com',
        role: 'admin',
        permissions: ['read', 'write', 'admin'],
        createdAt: expect.any(Date),
        lastLogin: expect.any(Date)
      });
    });

    it('should return null for non-existent user', async () => {
      // Mock non-existent user
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null
      });

      const userRole = await authService.getUserRole('test-uid');
      
      expect(userRole).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', async () => {
      // Mock admin user
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          uid: 'test-uid',
          email: 'admin@fairfieldairportcar.com',
          role: 'admin',
          permissions: ['read', 'write', 'admin'],
          createdAt: new Date(),
          lastLogin: new Date()
        })
      });

      const result = await authService.isAdmin('test-uid');
      
      expect(result).toBe(true);
    });

    it('should return false for non-admin user', async () => {
      // Mock non-admin user
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          uid: 'test-uid',
          email: 'user@example.com',
          role: 'user',
          permissions: ['read'],
          createdAt: new Date(),
          lastLogin: new Date()
        })
      });

      const result = await authService.isAdmin('test-uid');
      
      expect(result).toBe(false);
    });

    it('should return false for empty uid', async () => {
      const result = await authService.isAdmin('');
      
      expect(result).toBe(false);
    });
  });

  describe('canEdit', () => {
    it('should allow admin to edit', async () => {
      // Mock admin user
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          uid: 'test-uid',
          email: 'admin@fairfieldairportcar.com',
          role: 'admin',
          permissions: ['read', 'write', 'admin'],
          createdAt: new Date(),
          lastLogin: new Date()
        })
      });

      const result = await authService.canEdit('test-uid');
      
      expect(result).toBe(true);
    });

    it('should allow editor to edit', async () => {
      // Mock editor user
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          uid: 'test-uid',
          email: 'editor@example.com',
          role: 'editor',
          permissions: ['read', 'write'],
          createdAt: new Date(),
          lastLogin: new Date()
        })
      });

      const result = await authService.canEdit('test-uid');
      
      expect(result).toBe(true);
    });

    it('should not allow viewer to edit', async () => {
      // Mock viewer user
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          uid: 'test-uid',
          email: 'viewer@example.com',
          role: 'viewer',
          permissions: ['read'],
          createdAt: new Date(),
          lastLogin: new Date()
        })
      });

      const result = await authService.canEdit('test-uid');
      
      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle Firestore errors gracefully', async () => {
      // Mock Firestore error
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await authService.validateAdminAccess('test-uid');
      
      expect(result).toBe(false);
    });

    it('should handle getUserRole errors gracefully', async () => {
      // Mock Firestore error
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await authService.getUserRole('test-uid');
      
      expect(result).toBeNull();
    });
  });
}); 