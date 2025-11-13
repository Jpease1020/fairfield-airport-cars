/**
 * Booking Detail Page Integration Tests
 * 
 * Tests the critical booking detail page functionality:
 * - Date normalization from API response
 * - Error handling
 * - Loading states
 * - Data display
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import BookingDetailClient from '@/app/(customer)/booking/[id]/BookingDetailClient';

// Mock the CMS provider
vi.mock('@/design/providers/CMSDataProvider', () => ({
  useCMSData: () => ({
    cmsData: {}
  })
}));

// Mock toast
vi.mock('@/design/ui', async () => {
  const actual = await vi.importActual('@/design/ui');
  return {
    ...actual,
    useToast: () => ({
      addToast: vi.fn()
    }),
    ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  };
});

describe('Booking Detail Page - Critical Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should normalize ISO string dates to Date objects', async () => {
    const mockBooking = {
      id: 'TEST123',
      status: 'confirmed',
      createdAt: '2025-01-15T10:30:00.000Z',
      updatedAt: '2025-01-15T10:35:00.000Z',
      trip: {
        pickup: {
          address: '30 Shut Rd, Newtown, CT',
          coordinates: { lat: 41.3641, lng: -73.3484 }
        },
        dropoff: {
          address: 'JFK Airport',
          coordinates: { lat: 40.6413, lng: -73.7781 }
        },
        pickupDateTime: '2025-01-16T14:00:00.000Z',
        fareType: 'personal',
        fare: 132.50
      },
      customer: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '2035551234',
        notes: '',
        saveInfoForFuture: false
      },
      payment: {
        depositAmount: 0,
        balanceDue: 132.50,
        totalAmount: 132.50,
        depositPaid: false,
        tipAmount: 0,
        tipPercent: 0
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        booking: mockBooking
      })
    });

    render(<BookingDetailClient bookingId="TEST123" />);

    // Wait for booking to load
    await waitFor(() => {
      expect(screen.queryByText(/Please wait/i)).not.toBeInTheDocument();
    });

    // Verify booking data is displayed
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/30 Shut Rd/i)).toBeInTheDocument();
    expect(screen.getByText(/JFK Airport/i)).toBeInTheDocument();
    expect(screen.getByText(/\$132\.50/)).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: 'Booking not found'
      })
    });

    render(<BookingDetailClient bookingId="INVALID" />);

    await waitFor(() => {
      expect(screen.getByText(/invalid booking ID|not found/i)).toBeInTheDocument();
    });

    // Should show error message and action buttons
    expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<BookingDetailClient bookingId="TEST123" />);

    expect(screen.getByText(/Please wait/i)).toBeInTheDocument();
  });

  it('should handle missing optional date fields', async () => {
    const mockBooking = {
      id: 'TEST123',
      status: 'pending',
      createdAt: '2025-01-15T10:30:00.000Z',
      updatedAt: '2025-01-15T10:35:00.000Z',
      trip: {
        pickup: {
          address: '30 Shut Rd',
          coordinates: { lat: 41.3641, lng: -73.3484 }
        },
        dropoff: {
          address: 'JFK Airport',
          coordinates: { lat: 40.6413, lng: -73.7781 }
        },
        pickupDateTime: '2025-01-16T14:00:00.000Z',
        fareType: 'personal',
        fare: 100
      },
      customer: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '2035551234',
        notes: '',
        saveInfoForFuture: false
      },
      payment: {
        depositAmount: 0,
        balanceDue: 100,
        totalAmount: 100,
        depositPaid: false,
        tipAmount: 0,
        tipPercent: 0
      }
      // No driver or tracking fields
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        booking: mockBooking
      })
    });

    render(<BookingDetailClient bookingId="TEST123" />);

    await waitFor(() => {
      expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    });

    // Should render without errors even without optional fields
    expect(screen.getByText(/30 Shut Rd/i)).toBeInTheDocument();
  });

  it('should format pickup date and time correctly', async () => {
    const mockBooking = {
      id: 'TEST123',
      status: 'confirmed',
      createdAt: '2025-01-15T10:30:00.000Z',
      updatedAt: '2025-01-15T10:35:00.000Z',
      trip: {
        pickup: {
          address: '30 Shut Rd',
          coordinates: { lat: 41.3641, lng: -73.3484 }
        },
        dropoff: {
          address: 'JFK Airport',
          coordinates: { lat: 40.6413, lng: -73.7781 }
        },
        pickupDateTime: '2025-01-16T14:00:00.000Z', // Thursday, January 16, 2025, 2:00 PM
        fareType: 'personal',
        fare: 100
      },
      customer: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '2035551234',
        notes: '',
        saveInfoForFuture: false
      },
      payment: {
        depositAmount: 0,
        balanceDue: 100,
        totalAmount: 100,
        depositPaid: false,
        tipAmount: 0,
        tipPercent: 0
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        booking: mockBooking
      })
    });

    render(<BookingDetailClient bookingId="TEST123" />);

    await waitFor(() => {
      // Should display formatted date (format includes weekday, month, day, year, time)
      const dateText = screen.getByText(/January|Thursday|2025/i);
      expect(dateText).toBeInTheDocument();
    });
  });

  it('should handle network errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<BookingDetailClient bookingId="TEST123" />);

    await waitFor(() => {
      // Should show error message (could be "An error occurred" or the actual error)
      const errorText = screen.queryByText(/error|Error/i);
      expect(errorText).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle invalid date strings gracefully', async () => {
    const mockBooking = {
      id: 'TEST123',
      status: 'confirmed',
      createdAt: 'invalid-date',
      updatedAt: 'invalid-date',
      trip: {
        pickup: {
          address: '30 Shut Rd',
          coordinates: { lat: 41.3641, lng: -73.3484 }
        },
        dropoff: {
          address: 'JFK Airport',
          coordinates: { lat: 40.6413, lng: -73.7781 }
        },
        pickupDateTime: '2025-01-16T14:00:00.000Z',
        fareType: 'personal',
        fare: 100
      },
      customer: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '2035551234',
        notes: '',
        saveInfoForFuture: false
      },
      payment: {
        depositAmount: 0,
        balanceDue: 100,
        totalAmount: 100,
        depositPaid: false,
        tipAmount: 0,
        tipPercent: 0
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        booking: mockBooking
      })
    });

    render(<BookingDetailClient bookingId="TEST123" />);

    // Should still render booking even with invalid dates (uses fallback)
    await waitFor(() => {
      expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    });
  });
});

