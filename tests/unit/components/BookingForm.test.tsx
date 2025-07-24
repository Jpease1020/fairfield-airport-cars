import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingForm from '@/app/book/booking-form';
import { renderWithProviders, expectBookingFormToBeValid } from '../../utils/test-helpers';

// Mock the hooks and services
jest.mock('@/hooks/useCMS', () => ({
  useCMS: () => ({
    config: {
      bookingForm: {
        title: 'Book Your Ride',
        subtitle: 'Reserve your airport transportation'
      }
    },
    loading: false,
    error: null
  })
}));

jest.mock('@/lib/services/booking-service', () => ({
  createBooking: jest.fn().mockResolvedValue({ id: 'test-booking-123' }),
  estimateFare: jest.fn().mockResolvedValue({ fare: 150, distance: '45 miles' }),
  isTimeSlotAvailable: jest.fn().mockResolvedValue(true)
}));

describe('BookingForm Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders booking form with all required fields', () => {
    renderWithProviders(<BookingForm />);
    
    // Check that all form fields are present
    expectBookingFormToBeValid();
    
    // Check for specific form elements
    expect(screen.getByText(/Book Your Ride/i)).toBeInTheDocument();
    expect(screen.getByText(/Reserve your airport transportation/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate fare/i })).toBeInTheDocument();
  });

  test('validates required fields before submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingForm />);
    
    // Try to submit without filling required fields
    const calculateButton = screen.getByRole('button', { name: /calculate fare/i });
    await user.click(calculateButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone is required/i)).toBeInTheDocument();
    });
  });

  test('allows user to fill out the form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingForm />);
    
    // Fill out the form
    const nameInput = screen.getByPlaceholderText(/full name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const phoneInput = screen.getByPlaceholderText(/phone/i);
    
    await user.type(nameInput, 'John Smith');
    await user.type(emailInput, 'john@example.com');
    await user.type(phoneInput, '203-555-0123');
    
    // Check that values are set
    expect(nameInput).toHaveValue('John Smith');
    expect(emailInput).toHaveValue('john@example.com');
    expect(phoneInput).toHaveValue('203-555-0123');
  });

  test('handles form submission successfully', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingForm />);
    
    // Fill out required fields
    await user.type(screen.getByPlaceholderText(/full name/i), 'John Smith');
    await user.type(screen.getByPlaceholderText(/email/i), 'john@example.com');
    await user.type(screen.getByPlaceholderText(/phone/i), '203-555-0123');
    await user.type(screen.getByPlaceholderText(/pickup/i), 'Fairfield Station');
    await user.type(screen.getByPlaceholderText(/dropoff/i), 'JFK Airport');
    
    // Submit form
    const calculateButton = screen.getByRole('button', { name: /calculate fare/i });
    await user.click(calculateButton);
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/calculating/i)).toBeInTheDocument();
    });
  });

  test('displays fare estimate when calculated', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingForm />);
    
    // Fill out form
    await user.type(screen.getByPlaceholderText(/full name/i), 'John Smith');
    await user.type(screen.getByPlaceholderText(/email/i), 'john@example.com');
    await user.type(screen.getByPlaceholderText(/phone/i), '203-555-0123');
    await user.type(screen.getByPlaceholderText(/pickup/i), 'Fairfield Station');
    await user.type(screen.getByPlaceholderText(/dropoff/i), 'JFK Airport');
    
    // Calculate fare
    const calculateButton = screen.getByRole('button', { name: /calculate fare/i });
    await user.click(calculateButton);
    
    // Should show fare estimate
    await waitFor(() => {
      expect(screen.getByText(/\$150/i)).toBeInTheDocument();
      expect(screen.getByText(/45 miles/i)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock API error
    const { estimateFare } = require('@/lib/services/booking-service');
    estimateFare.mockRejectedValueOnce(new Error('API Error'));
    
    const user = userEvent.setup();
    renderWithProviders(<BookingForm />);
    
    // Fill out form
    await user.type(screen.getByPlaceholderText(/full name/i), 'John Smith');
    await user.type(screen.getByPlaceholderText(/email/i), 'john@example.com');
    await user.type(screen.getByPlaceholderText(/phone/i), '203-555-0123');
    await user.type(screen.getByPlaceholderText(/pickup/i), 'Fairfield Station');
    await user.type(screen.getByPlaceholderText(/dropoff/i), 'JFK Airport');
    
    // Try to calculate fare
    const calculateButton = screen.getByRole('button', { name: /calculate fare/i });
    await user.click(calculateButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingForm />);
    
    // Enter invalid email
    const emailInput = screen.getByPlaceholderText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    // Try to submit
    const calculateButton = screen.getByRole('button', { name: /calculate fare/i });
    await user.click(calculateButton);
    
    // Should show email validation error
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  test('handles passenger selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingForm />);
    
    const passengersSelect = screen.getByRole('combobox', { name: /passengers/i });
    await user.selectOptions(passengersSelect, '3');
    
    expect(passengersSelect).toHaveValue('3');
  });

  test('handles optional fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingForm />);
    
    // Fill optional fields
    const flightInput = screen.getByDisplayValue(/AA123/i);
    const notesTextarea = screen.getByDisplayValue(/pick up at the main entrance/i);
    
    await user.clear(flightInput);
    await user.type(flightInput, 'DL456');
    
    await user.clear(notesTextarea);
    await user.type(notesTextarea, 'Please call when arriving');
    
    expect(flightInput).toHaveValue('DL456');
    expect(notesTextarea).toHaveValue('Please call when arriving');
  });
}); 