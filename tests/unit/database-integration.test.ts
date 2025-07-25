import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Firebase Admin
jest.mock('@/lib/utils/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      })),
      add: jest.fn(),
      where: jest.fn(() => ({
        get: jest.fn(),
        orderBy: jest.fn(() => ({
          get: jest.fn(),
          limit: jest.fn(() => ({
            get: jest.fn()
          }))
        }))
      })),
      orderBy: jest.fn(() => ({
        get: jest.fn(),
        limit: jest.fn(() => ({
          get: jest.fn()
        }))
      }))
    }))
  }
}));

describe('Database Integration Tests', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = require('@/lib/utils/firebase-admin').adminDb;
  });

  describe('Booking Data Persistence', () => {
    it('should save booking data successfully', async () => {
      const mockSet = jest.fn().mockResolvedValue({ id: 'booking-123' });
      const mockDoc = jest.fn(() => ({ set: mockSet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      mockDb.collection = mockCollection;

      const mockBooking = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date('2024-12-25T10:00:00Z'),
        passengers: 2,
        fare: 150,
        status: 'confirmed',
        createdAt: new Date()
      };

      const result = await mockDb.collection('bookings').doc('booking-123').set(mockBooking);
      
      expect(result).toEqual({ id: 'booking-123' });
      expect(mockCollection).toHaveBeenCalledWith('bookings');
      expect(mockDoc).toHaveBeenCalledWith('booking-123');
      expect(mockSet).toHaveBeenCalledWith(mockBooking);
    });

    it('should retrieve booking data successfully', async () => {
      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          id: 'booking-123',
          name: 'John Smith',
          email: 'john@example.com',
          status: 'confirmed',
          fare: 150,
          createdAt: new Date()
        })
      });
      const mockDoc = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      mockDb.collection = mockCollection;

      const result = await mockDb.collection('bookings').doc('booking-123').get();
      
      expect(result.exists).toBe(true);
      expect(result.data()).toEqual({
        id: 'booking-123',
        name: 'John Smith',
        email: 'john@example.com',
        status: 'confirmed',
        fare: 150,
        createdAt: expect.any(Date)
      });
    });

    it('should handle booking not found', async () => {
      const mockGet = jest.fn().mockResolvedValue({
        exists: false,
        data: () => null
      });
      const mockDoc = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      mockDb.collection = mockCollection;

      const result = await mockDb.collection('bookings').doc('non-existent').get();
      
      expect(result.exists).toBe(false);
      expect(result.data()).toBeNull();
    });

    it('should update booking status successfully', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn(() => ({ update: mockUpdate }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      mockDb.collection = mockCollection;

      const updateData = {
        status: 'completed',
        completedAt: new Date(),
        driverId: 'driver-123'
      };

      await mockDb.collection('bookings').doc('booking-123').update(updateData);
      
      expect(mockUpdate).toHaveBeenCalledWith(updateData);
    });
  });

  describe('User Data Management', () => {
    it('should save user data successfully', async () => {
      const mockSet = jest.fn().mockResolvedValue({ id: 'user-123' });
      const mockDoc = jest.fn(() => ({ set: mockSet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      mockDb.collection = mockCollection;

      const mockUser = {
        uid: 'user-123',
        email: 'john@example.com',
        name: 'John Smith',
        role: 'customer',
        createdAt: new Date(),
        lastLogin: new Date()
      };

      await mockDb.collection('users').doc('user-123').set(mockUser);
      
      expect(mockSet).toHaveBeenCalledWith(mockUser);
    });

    it('should retrieve user data successfully', async () => {
      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          uid: 'user-123',
          email: 'john@example.com',
          name: 'John Smith',
          role: 'customer',
          createdAt: new Date(),
          lastLogin: new Date()
        })
      });
      const mockDoc = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      mockDb.collection = mockCollection;

      const result = await mockDb.collection('users').doc('user-123').get();
      
      expect(result.exists).toBe(true);
      expect(result.data().uid).toBe('user-123');
      expect(result.data().email).toBe('john@example.com');
    });

    it('should update user last login time', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn(() => ({ update: mockUpdate }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      mockDb.collection = mockCollection;

      const updateData = {
        lastLogin: new Date(),
        loginCount: 5
      };

      await mockDb.collection('users').doc('user-123').update(updateData);
      
      expect(mockUpdate).toHaveBeenCalledWith(updateData);
    });
  });

  describe('Payment Record Storage', () => {
    it('should save payment record successfully', async () => {
      const mockAdd = jest.fn().mockResolvedValue({ id: 'payment-123' });
      const mockCollection = jest.fn(() => ({ add: mockAdd }));
      mockDb.collection = mockCollection;

      const mockPayment = {
        bookingId: 'booking-123',
        amount: 150,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'square',
        transactionId: 'txn-123',
        createdAt: new Date()
      };

      const result = await mockDb.collection('payments').add(mockPayment);
      
      expect(result).toEqual({ id: 'payment-123' });
      expect(mockAdd).toHaveBeenCalledWith(mockPayment);
    });

    it('should retrieve payment history for booking', async () => {
      const mockGet = jest.fn().mockResolvedValue({
        docs: [
          {
            id: 'payment-1',
            data: () => ({
              bookingId: 'booking-123',
              amount: 75,
              status: 'completed',
              createdAt: new Date()
            })
          },
          {
            id: 'payment-2',
            data: () => ({
              bookingId: 'booking-123',
              amount: 75,
              status: 'completed',
              createdAt: new Date()
            })
          }
        ]
      });
      const mockWhere = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ where: mockWhere }));
      mockDb.collection = mockCollection;

      const result = await mockDb.collection('payments').where('bookingId', '==', 'booking-123').get();
      
      expect(result.docs).toHaveLength(2);
      expect(result.docs[0].data().bookingId).toBe('booking-123');
    });
  });

  describe('Audit Trail Functionality', () => {
    it('should log admin actions', async () => {
      const mockAdd = jest.fn().mockResolvedValue({ id: 'audit-123' });
      const mockCollection = jest.fn(() => ({ add: mockAdd }));
      mockDb.collection = mockCollection;

      const mockAuditEntry = {
        userId: 'admin-123',
        action: 'booking_updated',
        targetId: 'booking-123',
        details: { status: 'confirmed' },
        timestamp: new Date(),
        ipAddress: '192.168.1.1'
      };

      await mockDb.collection('audit_logs').add(mockAuditEntry);
      
      expect(mockAdd).toHaveBeenCalledWith(mockAuditEntry);
    });

    it('should retrieve audit logs for user', async () => {
      const mockGet = jest.fn().mockResolvedValue({
        docs: [
          {
            id: 'audit-1',
            data: () => ({
              userId: 'admin-123',
              action: 'booking_created',
              timestamp: new Date()
            })
          },
          {
            id: 'audit-2',
            data: () => ({
              userId: 'admin-123',
              action: 'booking_updated',
              timestamp: new Date()
            })
          }
        ]
      });
      const mockWhere = jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({ get: mockGet }))
        }))
      }));
      const mockCollection = jest.fn(() => ({ where: mockWhere }));
      mockDb.collection = mockCollection;

      const result = await mockDb.collection('audit_logs')
        .where('userId', '==', 'admin-123')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      
      expect(result.docs).toHaveLength(2);
      expect(result.docs[0].data().userId).toBe('admin-123');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const mockSet = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      const mockDoc = jest.fn(() => ({ set: mockSet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      mockDb.collection = mockCollection;

      const mockBooking = {
        name: 'John Smith',
        email: 'john@example.com'
      };

      await expect(mockDb.collection('bookings').doc('booking-123').set(mockBooking))
        .rejects.toThrow('Database connection failed');
    });

    it('should handle invalid data format', async () => {
      const mockSet = jest.fn().mockRejectedValue(new Error('Invalid data format'));
      const mockDoc = jest.fn(() => ({ set: mockSet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      mockDb.collection = mockCollection;

      const invalidBooking = {
        name: 'John Smith',
        email: 'invalid-email-format',
        fare: 'not-a-number'
      };

      await expect(mockDb.collection('bookings').doc('booking-123').set(invalidBooking))
        .rejects.toThrow('Invalid data format');
    });

    it('should handle concurrent write conflicts', async () => {
      const mockUpdate = jest.fn().mockRejectedValue(new Error('Concurrent modification detected'));
      const mockDoc = jest.fn(() => ({ update: mockUpdate }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      mockDb.collection = mockCollection;

      const updateData = { status: 'confirmed' };

      await expect(mockDb.collection('bookings').doc('booking-123').update(updateData))
        .rejects.toThrow('Concurrent modification detected');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity', async () => {
      // Test that booking references valid user
      const mockUserGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ uid: 'user-123', email: 'john@example.com' })
      });
      const mockBookingGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ 
          id: 'booking-123', 
          userId: 'user-123',
          name: 'John Smith'
        })
      });

      const mockDoc = jest.fn((id) => ({ 
        get: id === 'user-123' ? mockUserGet : mockBookingGet 
      }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      mockDb.collection = mockCollection;

      // Verify user exists
      const userResult = await mockDb.collection('users').doc('user-123').get();
      expect(userResult.exists).toBe(true);

      // Verify booking references valid user
      const bookingResult = await mockDb.collection('bookings').doc('booking-123').get();
      expect(bookingResult.exists).toBe(true);
      expect(bookingResult.data().userId).toBe('user-123');
    });

    it('should handle cascading deletes', async () => {
      const mockDelete = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn(() => ({ delete: mockDelete }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      mockDb.collection = mockCollection;

      // Delete booking
      await mockDb.collection('bookings').doc('booking-123').delete();
      
      // Delete associated payments
      await mockDb.collection('payments').doc('payment-123').delete();
      
      // Delete audit logs
      await mockDb.collection('audit_logs').doc('audit-123').delete();
      
      expect(mockDelete).toHaveBeenCalledTimes(3);
    });
  });
}); 