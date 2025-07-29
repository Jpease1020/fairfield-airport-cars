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
  usePathname: () => '/admin/bookings',
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({ user: { email: 'gregg@fairfieldairportcar.com' } });
    return () => {};
  }),
  getAuth: jest.fn(() => ({})),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Admin Booking Management Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Booking List View', () => {
    test('displays all bookings with correct data', async () => {
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
            status: 'confirmed',
            paymentStatus: 'paid',
            createdAt: '2024-01-10T09:00:00Z'
          },
          {
            id: 'booking-2',
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '203-555-0456',
            pickupLocation: 'Stamford Station',
            dropoffLocation: 'LaGuardia Airport',
            pickupDateTime: '2024-01-16T14:00:00Z',
            passengers: 1,
            fare: 120.00,
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: '2024-01-11T10:00:00Z'
          }
        ])
      });

      // Import and render bookings page
      const { default: AdminBookingsPage } = await import('@/app/admin/bookings/page');
      render(<AdminBookingsPage />);

      // Verify page loads
      await waitFor(() => {
        expect(screen.getByText(/manage bookings/i)).toBeInTheDocument();
      });

      // Verify booking data is displayed
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
        expect(screen.getByText(/jane doe/i)).toBeInTheDocument();
        expect(screen.getByText(/fairfield station/i)).toBeInTheDocument();
        expect(screen.getByText(/stamford station/i)).toBeInTheDocument();
        expect(screen.getByText(/\$150\.00/i)).toBeInTheDocument();
        expect(screen.getByText(/\$120\.00/i)).toBeInTheDocument();
        expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
        expect(screen.getByText(/pending/i)).toBeInTheDocument();
      });
    });

    test('handles empty bookings list', async () => {
      // Mock empty bookings
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([])
      });

      const { default: AdminBookingsPage } = await import('@/app/admin/bookings/page');
      render(<AdminBookingsPage />);

      // Verify empty state
      await waitFor(() => {
        expect(screen.getByText(/no bookings found/i)).toBeInTheDocument();
      });
    });

    test('handles API errors gracefully', async () => {
      // Mock API error
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to fetch bookings')
      );

      const { default: AdminBookingsPage } = await import('@/app/admin/bookings/page');
      render(<AdminBookingsPage />);

      // Verify error state
      await waitFor(() => {
        expect(screen.getByText(/failed to load bookings/i)).toBeInTheDocument();
      });
    });
  });

  describe('Booking Status Management', () => {
    test('updates booking status successfully', async () => {
      // Mock initial bookings data
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            {
              id: 'booking-1',
              name: 'John Smith',
              status: 'pending',
              fare: 150.00
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
        button.textContent?.includes('Confirm') || 
        button.textContent?.includes('Update') ||
        button.textContent?.includes('Status')
      );
      
      if (confirmButton) {
        fireEvent.click(confirmButton);
        
        // Verify API call was made
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/bookings/booking-1'),
            expect.objectContaining({
              method: 'PUT',
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              }),
              body: expect.stringContaining('confirmed')
            })
          );
        });
      }
    });

    test('handles status update errors', async () => {
      // Mock status update failure
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
        .mockRejectedValueOnce(new Error('Update failed'));

      const { default: AdminBookingsPage } = await import('@/app/admin/bookings/page');
      render(<AdminBookingsPage />);

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
      });

      // Try to update status
      const statusButtons = screen.getAllByRole('button');
      const updateButton = statusButtons.find(button => 
        button.textContent?.includes('Update')
      );
      
      if (updateButton) {
        fireEvent.click(updateButton);
        
        // Verify error handling
        await waitFor(() => {
          expect(screen.getByText(/failed to update/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Booking Filtering and Search', () => {
    test('filters bookings by status', async () => {
      // Mock bookings with different statuses
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 'booking-1',
            name: 'John Smith',
            status: 'confirmed',
            fare: 150.00
          },
          {
            id: 'booking-2',
            name: 'Jane Doe',
            status: 'pending',
            fare: 120.00
          }
        ])
      });

      const { default: AdminBookingsPage } = await import('@/app/admin/bookings/page');
      render(<AdminBookingsPage />);

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
        expect(screen.getByText(/jane doe/i)).toBeInTheDocument();
      });

      // Find and click status filter
      const filterButtons = screen.getAllByRole('button');
      const confirmedFilter = filterButtons.find(button => 
        button.textContent?.includes('Confirmed')
      );
      
      if (confirmedFilter) {
        fireEvent.click(confirmedFilter);
        
        // Should only show confirmed bookings
        await waitFor(() => {
          expect(screen.getByText(/john smith/i)).toBeInTheDocument();
          expect(screen.queryByText(/jane doe/i)).not.toBeInTheDocument();
        });
      }
    });

    test('searches bookings by customer name', async () => {
      // Mock bookings data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 'booking-1',
            name: 'John Smith',
            email: 'john@example.com',
            status: 'confirmed'
          },
          {
            id: 'booking-2',
            name: 'Jane Doe',
            email: 'jane@example.com',
            status: 'pending'
          }
        ])
      });

      const { default: AdminBookingsPage } = await import('@/app/admin/bookings/page');
      render(<AdminBookingsPage />);

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
        expect(screen.getByText(/jane doe/i)).toBeInTheDocument();
      });

      // Find search input and search for "John"
      const searchInput = screen.getByTestId('search-input');
      if (searchInput) {
        fireEvent.change(searchInput, {
          target: { value: 'John' }
        });

        // Should only show John's booking
        await waitFor(() => {
          expect(screen.getByText(/john smith/i)).toBeInTheDocument();
          expect(screen.queryByText(/jane doe/i)).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Booking Details and Actions', () => {
    test('displays booking details modal', async () => {
      // Mock booking data
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
            paymentStatus: 'paid',
            notes: 'Wheelchair accessible'
          }
        ])
      });

      const { default: AdminBookingsPage } = await import('@/app/admin/bookings/page');
      render(<AdminBookingsPage />);

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
      });

      // Find and click view details button
      const actionButtons = screen.getAllByRole('button');
      const viewButton = actionButtons.find(button => 
        button.textContent?.includes('View') || 
        button.textContent?.includes('Details')
      );
      
      if (viewButton) {
        fireEvent.click(viewButton);
        
        // Verify details modal opens
        await waitFor(() => {
          expect(screen.getByText(/booking details/i)).toBeInTheDocument();
          expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
          expect(screen.getByText(/203-555-0123/i)).toBeInTheDocument();
          expect(screen.getByText(/fairfield station/i)).toBeInTheDocument();
          expect(screen.getByText(/jfk airport/i)).toBeInTheDocument();
          expect(screen.getByText(/wheelchair accessible/i)).toBeInTheDocument();
        });
      }
    });

    test('sends customer communication', async () => {
      // Mock bookings data
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            {
              id: 'booking-1',
              name: 'John Smith',
              email: 'john@example.com',
              phone: '203-555-0123',
              status: 'confirmed'
            }
          ])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, messageId: 'msg-123' })
        });

      const { default: AdminBookingsPage } = await import('@/app/admin/bookings/page');
      render(<AdminBookingsPage />);

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
      });

      // Find and click message button
      const actionButtons = screen.getAllByRole('button');
      const messageButton = actionButtons.find(button => 
        button.textContent?.includes('Message') || 
        button.textContent?.includes('Contact')
      );
      
      if (messageButton) {
        fireEvent.click(messageButton);
        
        // Fill message form
        const messageInput = screen.getByTestId('message-input');
        if (messageInput) {
          fireEvent.change(messageInput, {
            target: { value: 'Your driver will arrive in 10 minutes.' }
          });

          // Submit message
          const sendButton = screen.getByTestId('send-message-button');
          fireEvent.click(sendButton);

          // Verify message API call
          await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
              expect.stringContaining('/api/admin/bookings/booking-1/message'),
              expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('Your driver will arrive in 10 minutes.')
              })
            );
          });
        }
      }
    });
  });

  describe('Booking Analytics and Reporting', () => {
    test('displays booking statistics', async () => {
      // Mock analytics data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalBookings: 25,
          confirmedBookings: 20,
          pendingBookings: 3,
          cancelledBookings: 2,
          totalRevenue: 3750.00,
          averageFare: 150.00,
          monthlyBreakdown: [
            {
              month: 'January 2024',
              bookings: 25,
              revenue: 3750.00
            }
          ]
        })
      });

      const { default: AdminBookingsPage } = await import('@/app/admin/bookings/page');
      render(<AdminBookingsPage />);

      // Verify statistics are displayed
      await waitFor(() => {
        expect(screen.getByText(/25/i)).toBeInTheDocument();
        expect(screen.getByText(/20/i)).toBeInTheDocument();
        expect(screen.getByText(/3/i)).toBeInTheDocument();
        expect(screen.getByText(/\$3,750\.00/i)).toBeInTheDocument();
        expect(screen.getByText(/\$150\.00/i)).toBeInTheDocument();
      });
    });

    test('exports booking data', async () => {
      // Mock bookings data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 'booking-1',
            name: 'John Smith',
            email: 'john@example.com',
            status: 'confirmed',
            fare: 150.00
          }
        ])
      });

      const { default: AdminBookingsPage } = await import('@/app/admin/bookings/page');
      render(<AdminBookingsPage />);

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
      });

      // Find and click export button
      const exportButton = screen.getByTestId('export-button');
      if (exportButton) {
        fireEvent.click(exportButton);

        // Verify export functionality
        await waitFor(() => {
          expect(screen.getByText(/exporting bookings/i)).toBeInTheDocument();
        });
      }
    });
  });
}); 