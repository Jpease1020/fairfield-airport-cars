import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { vi, describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-booking-123' }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Setup MSW server with proper base URL
const server = setupServer(
  http.get('http://localhost:3000/api/booking/get-booking/test-booking-123', () => {
    return HttpResponse.json({
      id: 'test-booking-123',
      name: 'John Smith',
      email: 'john@example.com',
      status: 'confirmed',
      pickupLocation: 'Fairfield Station',
      dropoffLocation: 'JFK Airport',
      pickupDateTime: '2024-12-25T10:00:00Z',
      passengers: 2,
      fare: 150
    });
  })
);

// MSW lifecycle hooks
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Simple component that fetches data
const BookingDetailsPage = () => {
  const [booking, setBooking] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/booking/get-booking/test-booking-123');
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Fetched data:', data);
        setBooking(data);
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, []);

  if (loading) {
    return React.createElement('div', { 'data-testid': 'loading' }, 'Loading...');
  }

  if (error) {
    return React.createElement('div', { 'data-testid': 'error' }, `Error: ${error}`);
  }

  if (!booking) {
    return React.createElement('div', { 'data-testid': 'no-booking' }, 'Booking not found');
  }

  return React.createElement('div', { 'data-testid': 'booking-details' }, 
    React.createElement('div', { 'data-testid': 'booking-name' }, booking.name || 'No name'),
    React.createElement('div', { 'data-testid': 'booking-status' }, booking.status || 'No status')
  );
};

describe('MSW with RTL - Booking Page', () => {
  it('should load booking details with MSW mocked data', async () => {
    render(React.createElement(BookingDetailsPage));
    
    // Initially shows loading
    expect(screen.getByTestId('loading')).toBeDefined();
    
    // Wait for booking details to load
    await screen.findByTestId('booking-details');
    
    // Check that the mocked data is displayed
    expect(screen.getByTestId('booking-name').textContent).toBe('John Smith');
    expect(screen.getByTestId('booking-status').textContent).toBe('confirmed');
  });
}); 