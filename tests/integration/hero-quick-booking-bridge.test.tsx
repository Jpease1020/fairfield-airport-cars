import React, { InputHTMLAttributes } from 'react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor, fireEvent } from '../utils/test-providers';
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
  cmsId?: string;
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
    cmsId,
    minDate: _minDate,
    fullWidth: _fullWidth,
    ...rest
  }: DateTimePickerMockProps) => (
    <input
      type="datetime-local"
      data-testid={dataTestId ?? cmsId ?? 'date-time-picker'}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      {...rest}
    />
  ),
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
    const datetimeInput = screen.getByTestId('quick-book-datetime-input') as HTMLInputElement;

    await user.type(pickupInput, pickupValue);
    await user.type(dropoffInput, dropoffValue);
    fireEvent.change(datetimeInput, { target: { value: '2025-12-31T10:30' } });

    const submitButton = await screen.findByTestId('quick-book-get-price-button');
    await waitFor(() => expect(submitButton).toBeEnabled());
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('pickup-location-input')).toHaveValue(pickupValue);
      expect(screen.getByTestId('dropoff-location-input')).toHaveValue(dropoffValue);
      expect(screen.getByTestId('pickup-datetime-input')).toHaveValue('2025-12-31T10:30');
    });

    const observer = screen.getByTestId('booking-observer');
    expect(observer.getAttribute('data-pickup')).toBe(pickupValue);
    expect(observer.getAttribute('data-dropoff')).toBe(dropoffValue);
    expect(observer.getAttribute('data-datetime')).toBe('2025-12-31T10:30');
    expect(observer.getAttribute('data-pickup-lat')).not.toBe('');
    expect(observer.getAttribute('data-dropoff-lat')).not.toBe('');
  });
});

