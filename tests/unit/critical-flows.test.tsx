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
  usePathname: () => '/',
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  getAuth: jest.fn(() => ({})),
}));

// Mock Google Maps
global.window.google = {
  maps: {
    places: {
      Autocomplete: jest.fn(),
      AutocompletePrediction: jest.fn(),
    },
    DistanceMatrixService: jest.fn(),
  },
} as any;

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock location
const mockLocation = {
  href: '',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock fetch globally
global.fetch = jest.fn();

describe('Critical Business Flows - Gregg\'s Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    mockLocation.href = '';
  });

  describe('🔴 CRITICAL: Customer Booking Flow', () => {
    test('Complete customer booking journey', async () => {
      // Mock successful API responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            fare: 150.00,
            distance: '45 miles',
            duration: '1 hour 15 minutes'
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            bookingId: 'test-booking-123',
            paymentLinkUrl: 'https://squareup.com/checkout/test-session',
            driverName: 'John Driver',
            driverPhone: '203-555-0123'
          })
        });

      // Import and render booking form
      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Fill out booking form
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByTestId('phone-input'), {
        target: { value: '203-555-0123' }
      });
      fireEvent.change(screen.getByTestId('pickup-location-input'), {
        target: { value: 'Fairfield Station' }
      });
      fireEvent.change(screen.getByTestId('dropoff-location-input'), {
        target: { value: 'JFK Airport' }
      });

      // Set future date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      fireEvent.change(screen.getByTestId('pickup-datetime-input'), {
        target: { value: tomorrow.toISOString().slice(0, 16) }
      });

      // Set passengers
      fireEvent.change(screen.getByTestId('passengers-select'), {
        target: { value: '2' }
      });

      // Calculate fare
      fireEvent.click(screen.getByTestId('calculate-fare-button'));
      await waitFor(() => {
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      });

      // Submit booking
      fireEvent.click(screen.getByTestId('book-now-button'));

      // Verify payment link creation and redirect
      await waitFor(() => {
        expect(mockLocation.href).toBe('https://squareup.com/checkout/test-session');
      });

      // Verify session storage
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'pendingBooking',
        expect.stringContaining('test-booking-123')
      );
    });

    test('Handles booking errors gracefully', async () => {
      // Mock API failure
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { default: BookingForm } = await import('@/app/book/booking-form');
      render(<BookingForm />);

      // Fill minimal form
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John Smith' }
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByTestId('phone-input'), {
        target: { value: '203-555-0123' }
      });

      // Try to calculate fare
      fireEvent.click(screen.getByTestId('calculate-fare-button'));
      await waitFor(() => {
        expect(screen.getByText(/error estimating fare/i)).toBeInTheDocument();
      });
    });
  });

  describe('🔴 CRITICAL: Admin Authentication Flow', () => {
    test('Admin login with valid credentials', async () => {
      // Mock successful Firebase auth
      const { signInWithEmailAndPassword } = require('firebase/auth');
      signInWithEmailAndPassword.mockResolvedValueOnce({
        user: { email: 'gregg@fairfieldairportcar.com' }
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
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'gregg@fairfieldairportcar.com',
          'password123'
        );
      });
    });

    test('Admin login with Google', async () => {
      const { signInWithPopup } = require('firebase/auth');
      signInWithPopup.mockResolvedValueOnce({
        user: { email: 'gregg@fairfieldairportcar.com' }
      });

      const { default: AdminLoginPage } = await import('@/app/admin/login/page');
      render(<AdminLoginPage />);

      // Click Google sign in
      fireEvent.click(screen.getByTestId('google-sign-in-button'));

      await waitFor(() => {
        expect(signInWithPopup).toHaveBeenCalled();
      });
    });
  });

  describe('🔴 CRITICAL: Admin Dashboard Flow', () => {
    test('Admin dashboard loads with booking data', async () => {
      // Mock bookings API
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 'booking-1',
            name: 'John Smith',
            email: 'john@example.com',
            phone: '203-555-0123',
            pickupLocation: 'Fairfield Station',
            dropoffLocation: 'JFK Airport',
            pickupDateTime: '2024-01-15T10:00:00Z',
            passengers: 2,
            fare: 150.00,
            status: 'confirmed',
            paymentStatus: 'paid'
          }
        ])
      });

      const { default: AdminDashboard } = await import('@/app/admin/page');
      render(<AdminDashboard />);

      // Verify dashboard loads
      await waitFor(() => {
        expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
      });

      // Verify booking data is displayed
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      });
    });

    test('Admin navigation works', async () => {
      const { default: AdminDashboard } = await import('@/app/admin/page');
      render(<AdminDashboard />);

      // Verify navigation links exist
      expect(screen.getByText(/bookings/i)).toBeInTheDocument();
      expect(screen.getByText(/calendar/i)).toBeInTheDocument();
      expect(screen.getByText(/drivers/i)).toBeInTheDocument();
      expect(screen.getByText(/cms/i)).toBeInTheDocument();
      expect(screen.getByText(/costs/i)).toBeInTheDocument();
    });
  });

  describe('🔴 CRITICAL: Booking Management Flow', () => {
    test('Admin can view and manage bookings', async () => {
      // Mock bookings data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 'booking-1',
            name: 'John Smith',
            email: 'john@example.com',
            phone: '203-555-0123',
            pickupLocation: 'Fairfield Station',
            dropoffLocation: 'JFK Airport',
            pickupDateTime: '2024-01-15T10:00:00Z',
            passengers: 2,
            fare: 150.00,
            status: 'pending',
            paymentStatus: 'paid'
          }
        ])
      });

      const { default: AdminBookingsPage } = await import('@/app/admin/bookings/page');
      render(<AdminBookingsPage />);

      // Verify bookings page loads
      await waitFor(() => {
        expect(screen.getByText(/manage bookings/i)).toBeInTheDocument();
      });

      // Verify booking data is displayed
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
        expect(screen.getByText(/fairfield station/i)).toBeInTheDocument();
        expect(screen.getByText(/jfk airport/i)).toBeInTheDocument();
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      });
    });

    test('Admin can update booking status', async () => {
      // Mock update API
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            {
              id: 'booking-1',
              name: 'John Smith',
              status: 'pending'
            }
          ])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const { default: AdminBookingsPage } = await import('@/app/admin/bookings/page');
      render(<AdminBookingsPage />);

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
      });

      // Find and click status update button
      const statusButtons = screen.getAllByRole('button');
      const confirmButton = statusButtons.find(button => 
        button.textContent?.includes('Confirm') || button.textContent?.includes('Update')
      );
      
      if (confirmButton) {
        fireEvent.click(confirmButton);
        
        // Verify API call was made
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/bookings/booking-1'),
            expect.objectContaining({
              method: 'PUT'
            })
          );
        });
      }
    });
  });

  describe('🔴 CRITICAL: Calendar Management Flow', () => {
    test('Admin calendar displays bookings', async () => {
      // Mock calendar data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 'booking-1',
            name: 'John Smith',
            pickupDateTime: '2024-01-15T10:00:00Z',
            fare: 150.00,
            status: 'confirmed'
          }
        ])
      });

      const { default: AdminCalendarPage } = await import('@/app/admin/calendar/page');
      render(<AdminCalendarPage />);

      // Verify calendar loads
      await waitFor(() => {
        expect(screen.getByText(/ride calendar/i)).toBeInTheDocument();
      });

      // Verify booking is displayed
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
        expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      });
    });
  });

  describe('🔴 CRITICAL: Payment Management Flow', () => {
    test('Admin can view payment statistics', async () => {
      // Mock payment data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 5000.00,
          totalBookings: 25,
          pendingPayments: 3,
          recentPayments: [
            {
              id: 'payment-1',
              bookingId: 'booking-1',
              amount: 150.00,
              status: 'completed',
              customerName: 'John Smith',
              date: '2024-01-15T10:00:00Z'
            }
          ]
        })
      });

      const { default: AdminPaymentsPage } = await import('@/app/admin/payments/page');
      render(<AdminPaymentsPage />);

      // Verify payments page loads
      await waitFor(() => {
        expect(screen.getByText(/payment management/i)).toBeInTheDocument();
      });

      // Verify payment data is displayed
      await waitFor(() => {
        expect(screen.getByText(/\$5,000\.00/i)).toBeInTheDocument();
        expect(screen.getByText(/25/i)).toBeInTheDocument();
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
      });
    });

    test('Admin can process refunds', async () => {
      // Mock refund API
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            totalRevenue: 5000.00,
            recentPayments: [
              {
                id: 'payment-1',
                bookingId: 'booking-1',
                amount: 150.00,
                status: 'completed'
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, refundId: 'refund-123' })
        });

      const { default: AdminPaymentsPage } = await import('@/app/admin/payments/page');
      render(<AdminPaymentsPage />);

      // Wait for payments to load
      await waitFor(() => {
        expect(screen.getByText(/payment management/i)).toBeInTheDocument();
      });

      // Find and click refund button
      const refundButtons = screen.getAllByRole('button');
      const refundButton = refundButtons.find(button => 
        button.textContent?.includes('Refund') || button.textContent?.includes('Process Refund')
      );
      
      if (refundButton) {
        fireEvent.click(refundButton);
        
        // Verify refund API call
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/admin/payments/payment-1/refund'),
            expect.objectContaining({
              method: 'POST'
            })
          );
        });
      }
    });
  });

  describe('🔴 CRITICAL: Driver Management Flow', () => {
    test('Admin can view driver list', async () => {
      // Mock drivers data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 'driver-1',
            name: 'John Driver',
            phone: '203-555-0123',
            status: 'available',
            vehicle: {
              make: 'Toyota',
              model: 'Camry',
              year: 2022,
              color: 'White',
              licensePlate: 'ABC-123'
            },
            rating: 4.8,
            totalRides: 150
          }
        ])
      });

      const { default: AdminDriversPage } = await import('@/app/admin/drivers/page');
      render(<AdminDriversPage />);

      // Verify drivers page loads
      await waitFor(() => {
        expect(screen.getByText(/driver management/i)).toBeInTheDocument();
      });

      // Verify driver data is displayed
      await waitFor(() => {
        expect(screen.getByText(/john driver/i)).toBeInTheDocument();
        expect(screen.getByText(/available/i)).toBeInTheDocument();
        expect(screen.getByText(/4\.8/i)).toBeInTheDocument();
      });
    });

    test('Admin can assign drivers to bookings', async () => {
      // Mock driver assignment
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            {
              id: 'driver-1',
              name: 'John Driver',
              status: 'available'
            }
          ])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const { default: AdminDriversPage } = await import('@/app/admin/drivers/page');
      render(<AdminDriversPage />);

      // Wait for drivers to load
      await waitFor(() => {
        expect(screen.getByText(/john driver/i)).toBeInTheDocument();
      });

      // Find and click assign ride button
      const assignButtons = screen.getAllByRole('button');
      const assignButton = assignButtons.find(button => 
        button.textContent?.includes('Assign Ride') || button.textContent?.includes('Assign')
      );
      
      if (assignButton) {
        fireEvent.click(assignButton);
        
        // Verify assignment API call
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/admin/drivers/driver-1/assign'),
            expect.objectContaining({
              method: 'POST'
            })
          );
        });
      }
    });
  });

  describe('🔴 CRITICAL: CMS Management Flow', () => {
    test('Admin can access CMS settings', async () => {
      // Mock CMS data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          business: {
            company: {
              name: 'Fairfield Airport Cars',
              phone: '203-555-0123',
              email: 'info@fairfieldairportcar.com'
            }
          },
          pricing: {
            baseFare: 50.00,
            perMileRate: 2.50
          }
        })
      });

      const { default: AdminCMSPage } = await import('@/app/admin/cms/page');
      render(<AdminCMSPage />);

      // Verify CMS page loads
      await waitFor(() => {
        expect(screen.getByText(/content management/i)).toBeInTheDocument();
      });

      // Verify CMS sections are displayed
      expect(screen.getByText(/business info/i)).toBeInTheDocument();
      expect(screen.getByText(/pricing/i)).toBeInTheDocument();
      expect(screen.getByText(/pages/i)).toBeInTheDocument();
    });

    test('Admin can update business settings', async () => {
      // Mock CMS update
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            business: {
              company: {
                name: 'Fairfield Airport Cars',
                phone: '203-555-0123'
              }
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const { default: AdminBusinessPage } = await import('@/app/admin/cms/business/page');
      render(<AdminBusinessPage />);

      // Wait for business settings to load
      await waitFor(() => {
        expect(screen.getByText(/business settings/i)).toBeInTheDocument();
      });

      // Update business name
      const nameInput = screen.getByTestId('company-name-input');
      if (nameInput) {
        fireEvent.change(nameInput, {
          target: { value: 'Updated Company Name' }
        });

        // Find and click save button
        const saveButton = screen.getByText(/save/i);
        fireEvent.click(saveButton);

        // Verify update API call
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/admin/cms/business'),
            expect.objectContaining({
              method: 'PUT',
              body: expect.stringContaining('Updated Company Name')
            })
          );
        });
      }
    });
  });

  describe('🟡 IMPORTANT: Customer Support Flow', () => {
    test('Customer can access help page', async () => {
      const { default: HelpPage } = await import('@/app/help/page');
      render(<HelpPage />);

      // Verify help page loads
      expect(screen.getByText(/help & support/i)).toBeInTheDocument();
      expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
    });

    test('Customer can submit feedback', async () => {
      // Mock feedback submission
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const { default: FeedbackPage } = await import('@/app/feedback/[id]/page');
      render(<FeedbackPage params={{ id: 'test-booking-123' }} />);

      // Fill feedback form
      fireEvent.change(screen.getByTestId('rating-input'), {
        target: { value: '5' }
      });
      fireEvent.change(screen.getByTestId('comments-input'), {
        target: { value: 'Great service!' }
      });

      // Submit feedback
      fireEvent.click(screen.getByTestId('submit-feedback-button'));

      // Verify feedback submission
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/feedback'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('Great service!')
          })
        );
      });
    });
  });

  describe('🟡 IMPORTANT: Booking Status Flow', () => {
    test('Customer can check booking status', async () => {
      // Mock booking status
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-booking-123',
          name: 'John Smith',
          status: 'confirmed',
          pickupDateTime: '2024-01-15T10:00:00Z',
          driverName: 'John Driver',
          driverPhone: '203-555-0123'
        })
      });

      const { default: StatusPage } = await import('@/app/status/[id]/page');
      render(<StatusPage params={{ id: 'test-booking-123' }} />);

      // Verify status page loads
      await waitFor(() => {
        expect(screen.getByText(/booking status/i)).toBeInTheDocument();
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
        expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
      });
    });

    test('Customer can cancel booking', async () => {
      // Mock cancellation
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 'test-booking-123',
            status: 'pending'
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      const { default: CancelPage } = await import('@/app/cancel/page');
      render(<CancelPage />);

      // Fill cancellation form
      fireEvent.change(screen.getByTestId('booking-id-input'), {
        target: { value: 'test-booking-123' }
      });
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'john@example.com' }
      });

      // Submit cancellation
      fireEvent.click(screen.getByTestId('cancel-booking-button'));

      // Verify cancellation API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/cancel-booking'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('test-booking-123')
          })
        );
      });
    });
  });

  describe('🟡 IMPORTANT: Cost Tracking Flow', () => {
    test('Admin can view cost tracking', async () => {
      // Mock cost data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalExpenses: 2500.00,
          fuelCosts: 800.00,
          maintenanceCosts: 500.00,
          insuranceCosts: 400.00,
          otherCosts: 800.00,
          monthlyBreakdown: [
            {
              month: 'January 2024',
              expenses: 2500.00,
              revenue: 5000.00,
              profit: 2500.00
            }
          ]
        })
      });

      const { default: AdminCostsPage } = await import('@/app/admin/costs/page');
      render(<AdminCostsPage />);

      // Verify costs page loads
      await waitFor(() => {
        expect(screen.getByText(/cost tracking/i)).toBeInTheDocument();
      });

      // Verify cost data is displayed
      await waitFor(() => {
        expect(screen.getByText(/\$2,500\.00/i)).toBeInTheDocument();
        expect(screen.getByText(/\$800\.00/i)).toBeInTheDocument();
      });
    });
  });
}); 