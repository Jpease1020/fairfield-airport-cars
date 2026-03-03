import React, { InputHTMLAttributes } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor, fireEvent, cleanup } from '../utils/test-providers';
import { HeroCompactBookingForm } from '@/design/components/content-sections/HeroCompactBookingForm';
import { TripDetailsPhase } from '@/components/booking/TripDetailsPhase';
import { useBooking } from '@/providers/BookingProvider';

type LocationInputMockProps = {
  value: string;
  onChange?: (value: string) => void;
  onLocationSelect?: (address: string, coordinates: { lat: number; lng: number }) => void;
  'data-testid'?: string;
  fullWidth?: boolean;
  restrictToAirports?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  [key: string]: unknown;
} & InputHTMLAttributes<HTMLInputElement>;

vi.mock('@/design/components/base-components/forms/LocationInput', () => ({
  __esModule: true,
  LocationInput: ({
    value,
    onChange,
    onLocationSelect,
    'data-testid': dataTestId = 'location-input',
    fullWidth: _fullWidth,
    restrictToAirports: _restrictToAirports,
    error: _error,
    size: _size,
    ...rest
  }: LocationInputMockProps) => (
    <input
      data-testid={dataTestId}
      value={value}
      onChange={(event) => {
        onChange?.(event.target.value);
        onLocationSelect?.(event.target.value, { lat: 41.1408, lng: -73.2642 });
      }}
      {...rest}
    />
  ),
}));

type DateTimePickerMockProps = {
  value?: string;
  onChange?: (value: string) => void;
  'data-testid'?: string;
  minDate?: Date;
  fullWidth?: boolean;
  [key: string]: unknown;
} & InputHTMLAttributes<HTMLInputElement>;

vi.mock('@/design/components/base-components/forms/DateTimePicker', () => ({
  __esModule: true,
  DateTimePicker: ({
    value = '',
    onChange,
    'data-testid': dataTestId,
    minDate: _minDate,
    fullWidth: _fullWidth,
    ...rest
  }: DateTimePickerMockProps) => {
    // Parse ISO string into date and time parts
    const datePart = value ? value.split('T')[0] : '';
    const timePart = value ? value.split('T')[1]?.slice(0, 5) : '';
    const testId = dataTestId ?? (typeof rest.id === 'string' ? rest.id : 'date-time-picker');
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value;
      const combined = newDate && timePart ? `${newDate}T${timePart}` : newDate ? `${newDate}T00:00` : '';
      onChange?.(combined);
    };
    
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = e.target.value;
      const combined = datePart && newTime ? `${datePart}T${newTime}` : newTime ? `${new Date().toISOString().split('T')[0]}T${newTime}` : '';
      onChange?.(combined);
    };
    
    return (
      <div data-testid={testId}>
        <input
          type="date"
          data-testid={`${testId}-date`}
          value={datePart}
          onChange={handleDateChange}
          {...rest}
        />
        <input
          type="time"
          data-testid={`${testId}-time`}
          value={timePart}
          onChange={handleTimeChange}
          {...rest}
        />
      </div>
    );
  },
}));

vi.mock('@/hooks/useFareCalculation', () => ({
  __esModule: true,
  useFareCalculation: vi.fn(() => ({
    fare: 129,
    isCalculating: false,
    error: null,
  })),
}));

vi.mock('@/hooks/useBookingAvailability', () => ({
  __esModule: true,
  useBookingAvailability: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    checkAvailability: vi.fn(),
  })),
}));

const cmsStub = {
  'tripDetailsPhase-locationTitle': 'Where are you going?',
  'tripDetailsPhase-locationDescription': 'Enter pickup and dropoff.',
  'tripDetailsPhase-yourLocationLabel': 'Pickup Location',
  'tripDetailsPhase-yourDestinationLabel': 'Dropoff Location',
  'tripDetailsPhase-airportPickupLabel': 'Airport Pickup',
  'tripDetailsPhase-airportDestinationLabel': 'Airport Destination',
  'tripDetailsPhase-homePlaceholder': 'Enter address',
  'tripDetailsPhase-airportPlaceholder': 'Enter airport',
  'tripDetailsPhase-airportHint': 'Search airports',
  'tripDetailsPhase-homeHint': 'Search addresses',
  'tripDetailsPhase-nextButton': 'Continue',
  'tripDetailsPhase-datetimeTitle': 'When do you need a ride?',
  'tripDetailsPhase-datetimeDescription': 'Select date and time.',
  'tripDetailsPhase-datetimeLabel': 'Pickup Date & Time',
  'tripDetailsPhase-fareTypeLabel': 'Fare Type',
  'tripDetailsPhase-personalFare': 'Personal',
  'tripDetailsPhase-businessFare': 'Business',
};

const BookingObserver = () => {
  const { formData } = useBooking();
  return (
    <div
      data-testid="booking-observer"
      data-pickup={formData.trip.pickup.address}
      data-dropoff={formData.trip.dropoff.address}
      data-datetime={formData.trip.pickupDateTime}
      data-pickup-lat={formData.trip.pickup.coordinates?.lat ?? ''}
      data-dropoff-lat={formData.trip.dropoff.coordinates?.lat ?? ''}
    />
  );
};

describe('Hero quick booking bridge', () => {
  afterEach(() => {
    cleanup();
  });
  it('persists hero quick booking data into the full booking form', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <>
        <HeroCompactBookingForm data-testid="hero-quick-booking-form" />
        <TripDetailsPhase cmsData={cmsStub} />
        <BookingObserver />
      </>
    );

    const pickupValue = 'Fairfield Station, Fairfield, CT';
    const dropoffValue = 'John F. Kennedy International Airport';
    const pickupInput = screen.getByTestId('quick-book-pickup-input');
    const dropoffInput = screen.getByTestId('quick-book-dropoff-input');
    const dateInput = screen.getByTestId('quick-book-datetime-input-date') as HTMLInputElement;
    const timeInput = screen.getByTestId('quick-book-datetime-input-time') as HTMLInputElement;

    await user.type(pickupInput, pickupValue);
    await user.type(dropoffInput, dropoffValue);
    fireEvent.change(dateInput, { target: { value: '2025-12-31' } });
    fireEvent.change(timeInput, { target: { value: '10:30' } });

    const submitButton = await screen.findByTestId('quick-book-secure-rate-button');
    // Button is always enabled now (validation happens on click)
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    await waitFor(() => {
      // Use getAllByTestId and check the last one (the one in the full booking form)
      const pickupInputs = screen.getAllByTestId('pickup-location-input');
      const dropoffInputs = screen.getAllByTestId('dropoff-location-input');
      const dateInputs = screen.getAllByTestId('pickup-datetime-input-date');
      const timeInputs = screen.getAllByTestId('pickup-datetime-input-time');
      
      // Check the last input (should be from the full booking form)
      expect(pickupInputs[pickupInputs.length - 1]).toHaveValue(pickupValue);
      expect(dropoffInputs[dropoffInputs.length - 1]).toHaveValue(dropoffValue);
      expect(dateInputs[dateInputs.length - 1]).toHaveValue('2025-12-31');
      expect(timeInputs[timeInputs.length - 1]).toHaveValue('10:30');
    });

    const observer = screen.getByTestId('booking-observer');
    expect(observer.getAttribute('data-pickup')).toBe(pickupValue);
    expect(observer.getAttribute('data-dropoff')).toBe(dropoffValue);
    expect(observer.getAttribute('data-datetime')).toBe('2025-12-31T10:30');
    expect(observer.getAttribute('data-pickup-lat')).not.toBe('');
    expect(observer.getAttribute('data-dropoff-lat')).not.toBe('');
  });
});
