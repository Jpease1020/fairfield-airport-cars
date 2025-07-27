import React from 'react';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import { Booking } from '@/types/booking';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Container, H3, Text } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
  onAction?: (action: 'edit' | 'cancel' | 'view') => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  showActions = false,
  onAction
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '❌';
      default:
        return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Container>
      {/* Header */}
      <Stack direction="horizontal" align="center" justify="between" spacing="md">
        <H3>
          {booking.name}
        </H3>
        <Text>
          Booking #{booking.id}
        </Text>
        <Badge>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </Stack>

      {/* Date and Time */}
      <Stack direction="horizontal" spacing="md">
        <Stack>
          <Calendar />
          <Text size="sm">{formatDate(booking.pickupDateTime.toString())}</Text>
        </Stack>
        <Stack>
          <Clock />
          <Text size="sm">{formatTime(booking.pickupDateTime.toString())}</Text>
        </Stack>
      </Stack>

      {/* Locations */}
      <Stack spacing="md">
        <Stack>
          <MapPin />
          <Text size="xs">Pickup:</Text>
          <Text size="sm">{booking.pickupLocation}</Text>
        </Stack>
        <Stack>
          <MapPin />
          <Text size="xs">Drop-off:</Text>
          <Text size="sm">{booking.dropoffLocation}</Text>
        </Stack>
      </Stack>

      {/* Passenger Info */}
      <Container>
        <Text size="sm">
          Passengers: {booking.passengers}
        </Text>
        {booking.notes && (
          <Container>
            <Text size="xs">Notes:</Text>
            <Text size="sm">{booking.notes}</Text>
          </Container>
        )}
      </Container>

      {/* Price */}
      <Stack direction="horizontal" align="center" spacing="sm">
        <DollarSign />
        <Text size="sm">Total Fare:</Text>
        <Text size="lg">
          ${booking.fare}
        </Text>
      </Stack>

      {/* Actions */}
      {showActions && onAction && (
        <Stack direction="horizontal" spacing="sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAction('view')}
          >
            View Details
          </Button>
          {booking.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('edit')}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('cancel')}
              >
                Cancel
              </Button>
            </>
          )}
        </Stack>
      )}
    </Container>
  );
};

export { BookingCard }; 