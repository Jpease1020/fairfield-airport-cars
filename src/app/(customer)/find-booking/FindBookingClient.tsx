'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Stack,
  Text,
  Button,
  Input,
  Label,
  RadioButton,
  Box,
  LoadingSpinner,
  H1,
  Badge
} from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';

interface Booking {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  status: string;
  fare: number;
}

export default function FindBookingClient() {
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.['find-booking'] || {};
  const router = useRouter();
  const [lookupType, setLookupType] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleLookup = async () => {
    if (!identifier.trim()) {
      setError('Please enter your email or phone number');
      return;
    }

    // Basic validation
    if (lookupType === 'email' && !identifier.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const queryParam = lookupType === 'email' ? 'email' : 'phone';
      const response = await fetch(`/api/booking/get-customer-bookings?${queryParam}=${encodeURIComponent(identifier.trim())}`);

      if (!response.ok) {
        throw new Error('Failed to find bookings');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.bookings)) {
        const transformedBookings: Booking[] = data.bookings.map((booking: any) => ({
          id: booking.id,
          pickupLocation: booking.trip?.pickup?.address || booking.pickupLocation || 'N/A',
          dropoffLocation: booking.trip?.dropoff?.address || booking.dropoffLocation || 'N/A',
          pickupDateTime: booking.trip?.pickupDateTime || booking.pickupDateTime || '',
          status: booking.status || 'pending',
          fare: booking.trip?.fare || booking.fare || 0
        }));
        setBookings(transformedBookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to find bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'completed';
      case 'confirmed': return 'confirmed';
      case 'in-progress': return 'warning';
      case 'pending': return 'pending';
      case 'cancelled': return 'cancelled';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'confirmed': return 'Confirmed';
      case 'in-progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  return (
    <Container maxWidth="2xl" padding="xl">
      <Stack spacing="xl">
        <Stack spacing="md" align="center">
          <H1 cmsId="find-booking-title">
            {pageCmsData?.['find-booking-title'] || 'Find My Booking'}
          </H1>
          <Text align="center" variant="muted" cmsId="find-booking-description">
            {pageCmsData?.['find-booking-description'] || 'Enter your email or phone number to find your bookings'}
          </Text>
        </Stack>

        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            {/* Lookup Type Selection */}
            <Stack spacing="md">
              <Label cmsId="lookup-by-label">{pageCmsData?.['lookup-by-label'] || 'Lookup By'}</Label>
              <Stack direction="horizontal" spacing="lg">
                <RadioButton
                  id="lookup-email"
                  name="lookup-type"
                  value="email"
                  checked={lookupType === 'email'}
                  onChange={(value) => {
                    setLookupType(value as 'email' | 'phone');
                    setIdentifier('');
                    setBookings([]);
                    setSearched(false);
                  }}
                  label="Email"
                />
                <RadioButton
                  id="lookup-phone"
                  name="lookup-type"
                  value="phone"
                  checked={lookupType === 'phone'}
                  onChange={(value) => {
                    setLookupType(value as 'email' | 'phone');
                    setIdentifier('');
                    setBookings([]);
                    setSearched(false);
                  }}
                  label="Phone"
                />
              </Stack>
            </Stack>

            {/* Input Field */}
            <Stack spacing="sm">
              <Label htmlFor="identifier">
                {lookupType === 'email' ? 'Email Address' : 'Phone Number'}
              </Label>
              <Input
                id="identifier"
                type={lookupType === 'email' ? 'email' : 'tel'}
                value={identifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
                placeholder={lookupType === 'email' ? 'your.email@example.com' : '(555) 123-4567'}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    handleLookup();
                  }
                }}
              />
            </Stack>

            {/* Error Message */}
            {error && (
              <Box variant="outlined" padding="md">
                <Text color="error">{error}</Text>
              </Box>
            )}

            {/* Search Button */}
            <Button
              onClick={handleLookup}
              disabled={loading || !identifier.trim()}
              variant="primary"
              cmsId="search-bookings"
            >
              {loading ? 'Searching...' : (pageCmsData?.['search-bookings'] || 'Find Bookings')}
            </Button>
          </Stack>
        </Box>

        {/* Loading State */}
        {loading && (
          <Stack spacing="md" align="center">
            <LoadingSpinner />
            <Text variant="muted" cmsId="searching-bookings">{pageCmsData?.['searching-bookings'] || 'Searching for bookings...'}</Text>
          </Stack>
        )}

        {/* Results */}
        {!loading && searched && (
          <>
            {bookings.length === 0 ? (
              <Box variant="elevated" padding="lg">
                <Stack spacing="md" align="center">
                  <Text weight="bold" size="lg" cmsId="no-bookings-found">
                    {pageCmsData?.['no-bookings-found'] || 'No Bookings Found'}
                  </Text>
                  <Text variant="muted" align="center">
                    {pageCmsData?.['no-bookings-message'] || 'We couldn\'t find any bookings for that email or phone number. Please check your information and try again.'}
                  </Text>
                </Stack>
              </Box>
            ) : (
              <Stack spacing="md">
                <Text weight="bold" size="lg">
                  {pageCmsData?.['bookings-found'] || `Found ${bookings.length} booking${bookings.length > 1 ? 's' : ''}`}
                </Text>
                {bookings.map((booking) => (
                  <Box key={booking.id} variant="elevated" padding="lg">
                    <Stack spacing="md">
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Text weight="bold" size="lg" cmsId="booking-number">
                          {pageCmsData?.['booking-number'] || 'Booking'} #{booking.id}
                        </Text>
                        <Badge variant={getStatusVariant(booking.status)}>
                          {getStatusText(booking.status)}
                        </Badge>
                      </Stack>
                      
                      <Stack spacing="sm">
                        <Text size="sm">
                          <strong>From:</strong> {booking.pickupLocation}
                        </Text>
                        <Text size="sm">
                          <strong>To:</strong> {booking.dropoffLocation}
                        </Text>
                        {booking.pickupDateTime && (
                          <Text size="sm">
                            <strong>Date/Time:</strong> {new Date(booking.pickupDateTime).toLocaleString()}
                          </Text>
                        )}
                        <Text size="sm" cmsId="fare-display">
                          <strong>{pageCmsData?.['fare-label'] || 'Fare:'}</strong> ${booking.fare.toFixed(2)}
                        </Text>
                      </Stack>

                      <Button
                        onClick={() => router.push(`/booking/${booking.id}`)}
                        variant="primary"
                        cmsId="view-booking-details"
                      >
                        {pageCmsData?.['view-booking-details'] || 'View Booking Details'}
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}

